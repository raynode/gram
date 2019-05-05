
import { GraphQLType, isType } from 'graphql'
import { forEach } from 'lodash'

import { createAttributeBuilder } from 'attributeBuilder'
import { createContextModel } from 'createContextModel'
import { AttributeBuilder, ContextMutator, ModelBuilder, ModelVisibility, Service } from 'types'

const serviceToVisibility = (service: Service<any>): ModelVisibility => ({
  createMutation: service.hasOwnProperty('create') && typeof service.create === 'function',
  createSubscription: service.hasOwnProperty('create') && typeof service.create === 'function',
  deleteMutation: service.hasOwnProperty('remove') && typeof service.remove === 'function',
  deleteSubscription: service.hasOwnProperty('remove') && typeof service.remove === 'function',
  findManyQuery: service.hasOwnProperty('findMany') && typeof service.findMany === 'function',
  findOneQuery: service.hasOwnProperty('findOne') && typeof service.findOne === 'function',
  updateMutation: service.hasOwnProperty('update') && typeof service.update === 'function',
  updateSubscription: service.hasOwnProperty('update') && typeof service.update === 'function',
})

export const createModelBuilder = <Context, Type>(
  modelName: string,
  service: Service<Type>,
  contextFn?: ContextMutator<Context, Type>,
): ModelBuilder<Context, Type> => {
  const attributes: Record<string, AttributeBuilder<Context, Type>> = {}
  let contextMutation: ContextMutator<Context, Type> = () => null
  let listType: GraphQLType | ModelBuilder<Context, any> = null
  let isInterface: boolean = false
  const interfaces: string[] = []
  const visibility = service ? serviceToVisibility(service) : {
    createMutation: false,
    deleteMutation: false,
    findManyQuery: false,
    findOneQuery: false,
    updateMutation: false,
    createSubscription: false,
    updateSubscription: false,
    deleteSubscription: false,
  }

  const builder: ModelBuilder<Context, Type> = {
    name: modelName,
    getInterfaces: () => interfaces,
    getListType: () => listType,
    setInterface: () => {
      isInterface = true
      return builder
    },
    isInterface: () => isInterface,
    attr: (attributeName, type) => {
      if(!type)
        throw new Error(`${modelName}.attr(${attributeName}) needs to provide either a GraphQLType or a ModelBuilder`)
      return attributes[attributeName] = isType(type)
      // add attribute
      ? createAttributeBuilder<Context, Type>(attributeName, () => type)
      // add association
      : createAttributeBuilder<Context, Type>(attributeName, context =>
          context.getModel(type.name).getType())
    },
    setup: context => {
      const contextModel = createContextModel(builder, service, context, visibility)
      if(contextFn)
        contextFn(contextModel, context)
      if(isInterface)
        contextModel.setInterface()
      context.addModel(modelName, contextModel)
    },
    build: (context => {
      const contextModel = context.getModel<Type>(modelName)
      forEach(attributes, attr => {
        contextModel.addField(attr.name, attr.build(context))
      })
      contextMutation(contextModel, context)
      return contextModel
    }),
    context: mutator => {
      contextMutation = mutator
      return builder
    },
    interface: modelName => {
      interfaces.push(modelName)
      return builder
    },
    listType: model => {
      listType = model
      return builder
    },
  }
  return builder
}


import { GraphQLType, isType } from 'graphql'
import { forEach } from 'lodash'

import { createAttributeBuilder } from 'attributeBuilder'
import { createContextModel } from 'createContextModel'
import { AttributeBuilder, ContextFn, ContextMutator, ModelBuilder } from 'types'

export const createModelBuilder =
  <Context, Type>(modelName: string, contextFn?: ContextFn<Context>): ModelBuilder<Context, Type> => {
    const attributes: Record<string, AttributeBuilder<Context, Type>> = {}
    let contextMutation: ContextMutator<Context> = () => null
    let listType: GraphQLType | ModelBuilder<Context, any>= null
    let isInterface: boolean = false
    const interfaces: string[] = []
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
        const contextModel = createContextModel(builder, context)
        if(isInterface)
          contextModel.setInterface()
        context.addModel(modelName, contextModel)
      },
      build: context => {
        const contextModel = context.getModel(modelName)
        forEach(attributes, attr => {
          contextModel.addField(attr.name, attr.build(context))
        })
        contextMutation(contextModel, context)
        return contextModel
      },
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

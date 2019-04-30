
import {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLType,
  isType,
  printType,
} from 'graphql'
import { forEach } from 'lodash'

import { createAttributeBuilder } from 'attributeBuilder'
import { defaultNamingStrategy } from 'strategies/naming'
import { AttributeBuilder, ContextFn, ContextModel, ContextMutator, ModelBuilder, Wrapped } from 'types'

const createBaseModel = (name: string) => ({
  name,
})

const createContextModel = <Context>(model: ModelBuilder<Context, any>, context: Wrapped<Context>) => {
  const fields: GraphQLFieldConfigMap<any, any> = {}
  const getFields = () => fields
  let type: GraphQLObjectType = null
  let listType: GraphQLType = null
  const contextModel: ContextModel = {
    name: model.name,
    names: defaultNamingStrategy(model.name),
    addField: (name: string, field: GraphQLFieldConfig<any, any>) => fields[name] = field,
    getFields,
    getType: () => {
      if(!type)
        type = new GraphQLObjectType({
          name: model.name,
          fields: getFields,
          interfaces: (): any => model.getInterfaces().map(context.getModel).map(model => model.getType()),
        })
      return type
    },
    getListType: () => {
      if(!listType)
        listType = model.getListType()
        ? context.getModel(model.getListType().name).getType()
        : GraphQLNonNull(GraphQLList(GraphQLNonNull(contextModel.getType()))) as GraphQLType
      return listType
    },
    visibility: {
      createMutation: true,
      deleteMutation: true,
      findManyQuery: true,
      findOneQuery: true,
      updateMutation: true,
      createSubscription: true,
      updateSubscription: true,
      deleteSubscription: true,
    },
  }
  return contextModel
}

export const createModelBuilder =
  <Context, Type>(modelName: string, contextFn?: ContextFn<Context>): ModelBuilder<Context, Type> => {
    const attributes: Record<string, AttributeBuilder<Context, Type>> = {}
    let contextMutation: ContextMutator<Context> = () => null
    let listType: ModelBuilder<Context, any> = null
    const interfaces: string[] = []
    const builder: ModelBuilder<Context, Type> = {
      ...createBaseModel(modelName),
      getInterfaces: () => interfaces,
      getListType: () => listType,
      attr: (attributeName, type) => {
        return attributes[attributeName] = isType(type)
        // add attribute
        ? createAttributeBuilder<Context, Type>(attributeName, () => type)
        // add association
        : createAttributeBuilder<Context, Type>(attributeName, context => context.getModel(type.name).getType())
      },
      setup: context => {
        context.addModel(modelName, createContextModel(builder, context))
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

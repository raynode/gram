
import {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLType,
  isType,
  printType,
} from 'graphql'
import { forEach } from 'lodash'

import { createAttributeBuilder } from 'attributeBuilder'
import { createContextModel } from 'createContextModel'
import { defaultNamingStrategy } from 'strategies/naming'
import { AttributeBuilder, ContextFn, ContextModel, ContextMutator, ModelBuilder, Wrapped } from 'types'
import { toList } from 'utils'

const createBaseModel = (name: string) => ({
  name,
})

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

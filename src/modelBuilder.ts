import { GraphQLID, GraphQLString, GraphQLType, isType } from 'graphql'
import { forEach, memoize } from 'lodash'

import { createAttributeBuilder } from './attributeBuilder'
import { createContextModel } from './createContextModel'
import {
  AttributeBuilder,
  ContextFn,
  ContextModel,
  ContextMutator,
  ModelBuilder,
  ModelType,
  ModelVisibility,
  Service,
} from './types'
import { MODELBUILDER } from './types/constants'
import { record } from './utils'

const serviceToVisibility = (service: Service<any>): ModelVisibility => {
  const { exists } = record(service)
  return {
    createMutation: exists('create'),
    createSubscription: exists('create'),
    deleteMutation: exists('remove'),
    deleteSubscription: exists('remove'),
    findManyQuery: exists('findMany'),
    findOneQuery: exists('findOne'),
    updateMutation: exists('update'),
    updateSubscription: exists('update'),
  }
}

export const createModelBuilder = <Context, Type>(
  modelName: string,
  service: Service<Type>,
  contextFn?: ContextMutator<Context, Type>,
): ModelBuilder<Context, Type> => {
  const attributes: Record<string, AttributeBuilder<Context, any, Type>> = {}
  let contextMutation: ContextMutator<Context, Type> = () => null
  let listType: GraphQLType | ModelBuilder<Context, any> = null
  let isInterface: boolean = false
  const interfaces: string[] = []
  const visibility = service
    ? serviceToVisibility(service)
    : {
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
    type: MODELBUILDER,
    name: modelName,
    getInterfaces: () => interfaces,
    getListType: () => listType,
    setInterface: () => {
      isInterface = true
      return builder
    },
    isInterface: () => isInterface,
    attr: <AttributeType>(
      attributeName: string,
      type:
        | ModelType<Context>
        | ModelBuilder<Context, any>
        | ContextFn<Context, GraphQLType>,
    ) => {
      if (!type)
        throw new Error(
          `${modelName}.attr(${attributeName}) needs to provide either a GraphQLType or a ModelBuilder`,
        )
      const contextFn: ContextFn<
        Context,
        GraphQLType | ContextModel<Context, any>
      > =
        typeof type === 'function'
          ? type
          : isType(type)
          ? () => type
          : context => context.getModel(type.name)
      return (attributes[attributeName] = createAttributeBuilder<
        Context,
        AttributeType,
        Type
      >(attributeName, contextFn))
    },
    setup: context => {
      const contextModel = createContextModel(
        builder,
        service,
        context,
        visibility,
      )
      if (contextFn) contextFn(contextModel, context)
      if (isInterface) contextModel.setInterface()
      context.addModel(modelName, contextModel)
    },
    build: memoize(
      context => {
        const contextModel = context.getModel<Type>(modelName)
        forEach(attributes, attr => contextModel.addField(attr))
        contextMutation(contextModel, context)
        return contextModel
      },
      context => context.id,
    ),
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

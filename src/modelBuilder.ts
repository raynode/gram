import { GraphQLType } from 'graphql'
import { forEach, memoize } from 'lodash'

import { createAttributeBuilder } from './attributeBuilder'
import { createContextModel } from './createContextModel'
import {
  AttributeBuilder,
  Attributes,
  ContextFn,
  ContextMutator,
  GraphQLResolverMap,
  ModelBuilder,
  ModelType,
  ModelVisibility,
  Service,
} from './types'
import { MODELBUILDER } from './types/constants'
import { record, toContextFn } from './utils'

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

export const createModelBuilder = <Context, Type, GQLType = Type>(
  modelName: string,
  service: Service<Type, GQLType>,
  contextFn?: ContextMutator<Context, Type, GQLType>,
) => {
  const attributes: Attributes<Context, Type> = {}
  let contextMutation: ContextMutator<Context, Type, GQLType> = () => null
  let listType: GraphQLType | ModelBuilder<Context, any> = null
  let isInterface: boolean = false
  let resolver: ContextFn<Context, GraphQLResolverMap<GQLType>> = null
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

  const builder: ModelBuilder<Context, Type, GQLType> = {
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
      return (attributes[attributeName] = createAttributeBuilder<
        Context,
        AttributeType,
        Type
      >(attributeName, toContextFn<Context>(type)))
    },
    setup: context => {
      const contextModel = createContextModel(
        builder,
        service,
        context,
        visibility,
        resolver ? resolver(context) : {},
      )
      if (contextFn) contextFn(contextModel, context)
      if (isInterface) contextModel.setInterface()
      context.addModel(modelName, contextModel)
    },
    build: memoize(
      context => {
        const contextModel = context.getModel<Type, GQLType>(modelName)
        forEach(attributes, attr => contextModel.addField(attr))
        interfaces
          .map(name => context.getBaseModel(name))
          .forEach(model => {
            forEach(model.getAttributes(), (attr, name) => {
              if (!attributes.hasOwnProperty(name)) contextModel.addField(attr)
            })
          })
        contextMutation(contextModel, context)
        return contextModel
      },
      context => context.id,
    ),
    resolve: modelResolver => {
      resolver = modelResolver
      return builder
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
    getAttributes: () => attributes,
  }
  return builder
}

import { GraphQLType } from 'graphql'
import { IFieldResolver } from 'graphql-tools'
import { forEach, memoize } from 'lodash'

import { createAttributeBuilder } from './attributeBuilder'
import { createModel } from './createModel'
import {
  AttributeBuilder,
  Attributes,
  ContextFn,
  ContextMutator,
  GraphQLResolverMap,
  ModelBuilder,
  ModelType,
  ModelVisibility,
  NodeType,
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

export const createModelBuilder = <
  BuildMode,
  Type extends NodeType,
  GQLType = Type
>(
  modelName: string,
  service: Service<Type, GQLType>,
  buildModeFn?: ContextMutator<BuildMode, Type, GQLType>,
) => {
  const attributes: Attributes<BuildMode, Type> = {}
  let contextMutation: ContextMutator<BuildMode, Type, GQLType> = () => null
  let listType: GraphQLType | ModelBuilder<BuildMode, any> = null
  let isInterface: boolean = false
  let resolver: ContextFn<
    BuildMode,
    Record<string, IFieldResolver<GQLType, any>>
  > = null
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

  const builder: ModelBuilder<BuildMode, Type, GQLType> = {
    type: MODELBUILDER,
    name: modelName,
    getInterfaces: () => interfaces,
    setInterface: () => {
      isInterface = true
      return builder
    },
    isInterface: () => isInterface,
    attr: <AttributeType extends NodeType>(
      attributeName: string,
      type:
        | string
        | ModelType<BuildMode>
        | ModelBuilder<BuildMode, any>
        | ContextFn<BuildMode, GraphQLType>,
    ) => {
      if (!type)
        throw new Error(
          `${modelName}.attr(${attributeName}) needs to provide either a GraphQLType or a ModelBuilder`,
        )
      return (attributes[attributeName] = createAttributeBuilder<
        BuildMode,
        AttributeType,
        Type
      >(attributeName, toContextFn(type)))
    },
    setup: buildMode => {
      const buildModeModel = createModel(
        builder,
        service,
        buildMode,
        visibility,
        resolver ? resolver(buildMode) : null,
      )
      if (buildModeFn) buildModeFn(buildModeModel, buildMode)
      if (isInterface) buildModeModel.setInterface()
      buildMode.addModel(modelName, buildModeModel)
    },
    build: memoize(
      buildMode => {
        const buildModeModel = buildMode.getModel<Type, GQLType>(modelName)
        forEach(attributes, buildModeModel.addField)
        interfaces.map(buildMode.getBaseModel).forEach(model => {
          forEach(model.getAttributes(), (attr, name) => {
            if (!attributes.hasOwnProperty(name)) buildModeModel.addField(attr)
          })
        })
        contextMutation(buildModeModel, buildMode)
        return buildModeModel
      },
      buildMode => buildMode.id,
    ),
    resolve: modelResolver => {
      resolver = modelResolver
      return builder
    },
    buildMode: mutator => {
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
    getResolver: buildMode => (resolver ? resolver(buildMode) : null),
    getVisibility: () => visibility,
    getService: () => service,
  }
  return builder
}

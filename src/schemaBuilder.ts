import { DateTime } from '@saeris/graphql-scalars'
import {
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  GraphQLID,
  GraphQLInputFieldConfigMap,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLSchemaConfig,
  GraphQLString,
  GraphQLType,
  isType,
} from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { GraphQLJSONObject } from 'graphql-type-json'
import { filter, forEach, reduce } from 'lodash'
import { v4 as uuid } from 'uuid'

import { createModelBuilder } from './modelBuilder'
import { createFilterStrategy, defaultMiddlewares } from './strategies/filter'
import {
  ContextModel,
  ContextMutator,
  FieldDefinition,
  FilterMiddleware,
  GenericGraphQLType,
  ListType,
  ModelBuilder,
  NodeType,
  PageData,
  QueryTypeDefinition,
  SchemaBuilder,
  Service,
  WithContext,
  Wrapped,
} from './types'
import { SCHEMABUILDER } from './types/constants'

import { addModel, createBuild } from './createBuild'

const wrapContext = <BuildMode>(
  buildMode: BuildMode | null,
  scalars: Record<string, GraphQLScalarType>,
  models: Models<BuildMode>,
  filters: FilterMiddleware[],
  pubSub: PubSub,
): Wrapped<BuildMode> => {
  const buildModeModels: Record<string, ContextModel<BuildMode, any>> = {}
  return {
    id: uuid(),
    buildMode,
    filterStrategy: createFilterStrategy(filters),
    addModel: (name, model) => (buildModeModels[name] = model),
    getBaseModel: name => models[name],
    getModel: name => buildModeModels[name],
    getScalar: name => scalars[name],
    pubSub,
  }
}

const createBaseModels = <BuildMode>() => {
  const node = createModelBuilder<BuildMode, NodeType>(
    'Node',
    {},
  ).setInterface()
  const page = createModelBuilder<BuildMode, any>('Page', {})
  const list = createModelBuilder<BuildMode, any>('List', {}).setInterface()

  node.attr('id', GraphQLID)
  node.attr('createdAt', buildMode => buildMode.getScalar('DateTime'))
  node.attr('updatedAt', buildMode => buildMode.getScalar('DateTime'))
  node.attr('deletedAt', buildMode => buildMode.getScalar('DateTime'))

  page.attr('page', GraphQLInt)
  page.attr('limit', GraphQLInt)
  page.attr('offset', GraphQLInt)

  list.attr('page', page)
  list.attr('nodes', node).isList()

  return {
    Node: node,
    Page: page,
    List: list,
  }
}

type Models<BuildMode> = Record<string, ModelBuilder<BuildMode, any, any>>

const setup = <BuildMode>(
  models: Models<BuildMode>,
  scalars: Record<string, GraphQLScalarType>,
  buildMode: BuildMode | null,
  filters: FilterMiddleware[],
  pubSub: PubSub = new PubSub(),
) => {
  const wrapped = wrapContext(buildMode, scalars, models, filters, pubSub)
  forEach(models, model => model.setup(wrapped))
  return wrapped
}

export const createSchemaBuilder = <BuildMode = any, QueryContext = any>() => {
  const models: Models<BuildMode> = createBaseModels<BuildMode>()
  const scalars: Record<string, GraphQLScalarType> = { DateTime }
  const filters = defaultMiddlewares
  let externalPubSub: PubSub = null
  const queryDefinitions: Array<
    WithContext<BuildMode, QueryTypeDefinition<BuildMode, any, QueryContext>>
  > = []

  const builder: SchemaBuilder<BuildMode, QueryContext> = {
    type: SCHEMABUILDER,
    models,
    model: <Type extends NodeType, GQLType = Type>(
      modelName: string,
      service: Service<Type, GQLType, QueryContext>,
    ) => {
      const model = createModelBuilder<BuildMode, Type, GQLType>(
        modelName,
        service || {},
      )
      models[modelName] = model
      return model.interface('Node')
    },
    interface: <Type extends NodeType>(
      interfaceName: string,
      service: Service<Type, Type, QueryContext>,
    ) => {
      const model = createModelBuilder<BuildMode, Type>(
        interfaceName,
        service || {},
      )
      models[interfaceName] = model
      model.setInterface()
      return model
    },
    build: (buildMode: BuildMode = null) =>
      builder.createBuild(buildMode).toSchema(),
    createBuild: buildMode => {
      const pubSub = externalPubSub || new PubSub()
      const wrapped = setup(models, scalars, buildMode, filters, pubSub)

      // build all interfaces
      filter(models, model => model.isInterface()).forEach(model =>
        model.build(wrapped),
      )

      const build = addModel(
        createBuild<BuildMode, QueryContext>(buildMode),
        wrapped,
      )

      // need to add all scalars first as the models need to know what a scalar is
      forEach(scalars, scalar => build.addType(scalar.toString()))

      forEach(models, build.addModel)

      forEach(queryDefinitions, queryDefinition => {
        const { name, args, type, resolver } =
          typeof queryDefinition === 'function'
            ? queryDefinition(wrapped)
            : queryDefinition
        const typeName = isType(type)
          ? type.toString()
          : typeof type === 'string'
          ? type
          : type.name
        build.addQuery(name, { args, type: typeName }, resolver)
      })
      return build
    },
    setScalar: (key, type) => {
      scalars[key] = type
      return type
    },
    getScalar: key => scalars[key],
    setPubSub: (pubSub: PubSub) => {
      externalPubSub = pubSub
      return builder
    },
    addFilter: (check, filter) => {
      filters.push([check, filter])
      return builder
    },
    addQuery: definition => {
      queryDefinitions.push(definition)
      return builder
    },
  }

  return builder
}

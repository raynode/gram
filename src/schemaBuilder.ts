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
import { GraphQLJSONObject } from 'graphql-type-json'
import { filter, forEach, reduce } from 'lodash'
import { v4 as uuid } from 'uuid'

import {
  mutationFieldsReducer,
  queryFieldsReducer,
  subscriptionFieldsReducer,
} from './field-reducers'
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
import { isFieldDefinition } from './types/guards'
import { extractData, reduceFields } from './utils'

const wrapContext = <Context>(
  context: Context | null,
  scalars: Record<string, GraphQLScalarType>,
  models: Models<Context>,
  filters: FilterMiddleware[],
): Wrapped<Context> => {
  const contextModels: Record<string, ContextModel<Context, any>> = {}
  return {
    id: uuid(),
    context,
    filterStrategy: createFilterStrategy(filters),
    addModel: (name, model) => (contextModels[name] = model),
    getBaseModel: name => models[name],
    getModel: name => contextModels[name],
    getScalar: name => scalars[name],
  }
}

const addNodeAttrs = <Context>(model: ModelBuilder<Context, any>) => {
  model.attr('id', GraphQLID)
  model.attr('createdAt', context => context.getScalar('DateTime'))
  model.attr('updatedAt', context => context.getScalar('DateTime'))
  model.attr('deletedAt', context => context.getScalar('DateTime'))
  return model
}

const createBaseModels = <Context>() => {
  const node = createModelBuilder<Context, NodeType>('Node', {}).setInterface()
  const page = createModelBuilder<Context, PageData>('Page', {})
  const list = createModelBuilder<Context, ListType<NodeType>>(
    'List',
    {},
  ).setInterface()

  addNodeAttrs(node)

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

type Models<Context> = Record<string, ModelBuilder<Context, any, any>>

const setup = <Context>(
  models: Models<Context>,
  scalars: Record<string, GraphQLScalarType>,
  context: Context | null,
  filters: FilterMiddleware[],
) => {
  const wrapped = wrapContext(context, scalars, models, filters)
  forEach(models, model => model.setup(wrapped))
  return wrapped
}

export const createSchema = (definition: FieldDefinition) => {
  const schema: GraphQLSchemaConfig = {
    query: new GraphQLObjectType({
      name: 'Query',
      fields: definition.query,
    }),
  }
  if (Object.keys(definition.mutation).length)
    schema.mutation = new GraphQLObjectType({
      name: 'Mutation',
      fields: definition.mutation,
    })
  if (Object.keys(definition.subscription).length)
    schema.subscription = new GraphQLObjectType({
      name: 'Subscription',
      fields: definition.subscription,
    })
  return new GraphQLSchema(schema)
}

export const createSchemaBuilder = <Context = any, QueryContext = any>() => {
  const models: Models<Context> = createBaseModels<Context>()
  const scalars: Record<string, GraphQLScalarType> = { DateTime }
  const filters = defaultMiddlewares
  const queryDefinitions: Array<
    WithContext<Context, QueryTypeDefinition<Context, any, QueryContext>>
  > = []

  const builder: SchemaBuilder<Context, QueryContext> = {
    type: SCHEMABUILDER,
    models,
    model: <Type, GQLType = Type>(
      modelName: string,
      service: Service<Type, GQLType>,
    ) => {
      const model = createModelBuilder<Context, Type, GQLType>(
        modelName,
        service || {},
      )
      models[modelName] = model
      return model.interface('Node')
    },
    interface: <Type>(interfaceName: string, service: Service<Type>) => {
      const model = createModelBuilder<Context, Type>(
        interfaceName,
        service || {},
      )
      models[interfaceName] = model
      model.setInterface()
      return model
    },
    build: (context: Context | FieldDefinition = null) =>
      createSchema(
        isFieldDefinition(context) ? context : builder.fields(context),
      ),
    fields: (context: Context | null = null) => {
      const wrapped = setup(models, scalars, context, filters)
      // build all interfaces
      filter(models, model => model.isInterface()).forEach(model =>
        model.build(wrapped),
      )
      const query: any = queryDefinitions.reduce((memo, queryDefinition) => {
        const {
          args,
          name,
          resolver: resolve,
          type: contextType,
        } = extractData(queryDefinition)(wrapped)
        const type = isType(contextType)
          ? contextType
          : wrapped.getModel(contextType.name).getType()
        memo[name] = { name, type, args, resolve }
        return memo
      }, {})
      // create the query, mutation and subscription fields
      return reduceFields(
        models,
        {
          query: queryFieldsReducer(wrapped),
          mutation: mutationFieldsReducer(wrapped),
          subscription: subscriptionFieldsReducer(wrapped),
        },
        {
          mutation: {},
          query,
          subscription: {},
        },
      )
    },
    setScalar: (key, type) => {
      scalars[key] = type
      return type
    },
    getScalar: key => scalars[key],
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

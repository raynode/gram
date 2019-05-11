import {
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  GraphQLID,
  GraphQLInputFieldConfigMap,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLType,
} from 'graphql'
import { forEach, reduce } from 'lodash'
import { createModelBuilder } from './modelBuilder'
import {
  ContextModel,
  ContextMutator,
  FieldDefinition,
  GenericGraphQLType,
  ListType,
  ModelBuilder,
  NodeType,
  PageData,
  SchemaBuilder,
  Service,
  Wrapped,
} from './types'
import { isFieldDefinition } from './types/guards'

import { v4 as uuid } from 'uuid'
import {
  mutationFieldsReducer,
  queryFieldsReducer,
  subscriptionFieldsReducer,
} from './field-reducers'
import { SCHEMABUILDER } from './types/constants'

import { reduceFields } from 'utils'
import { DateType, JSONType } from './generic-types'

const wrapContext = <Context>(
  context: Context | null,
  generics: Record<string, GraphQLType>,
): Wrapped<Context> => {
  const models: Record<string, ContextModel<Context, any>> = {}
  return {
    id: uuid(),
    context,
    addModel: (name, model) => (models[name] = model),
    getModel: name => models[name],
    getGenericType: name => generics[name],
  }
}

export const createSchemaBuilder = <Context = any>(): SchemaBuilder<
  Context
> => {
  const addNodeAttrs = (model: ModelBuilder<Context, any>) => {
    model.attr('id', GraphQLID)
    model.attr('createdAt', context => context.getGenericType('Date'))
    model.attr('updatedAt', context => context.getGenericType('Date'))
    model.attr('deletedAt', context => context.getGenericType('Date'))
    return model
  }

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

  const models: Record<string, ModelBuilder<Context, any>> = {
    Node: node,
    Page: page,
    List: list,
  }

  const generics: Record<GenericGraphQLType, GraphQLType> = {
    Date: DateType,
    JSON: JSONType,
  }

  const setup = (context: Context | null) => {
    const wrapped = wrapContext(context, generics)
    forEach(models, model => model.setup(wrapped))

    models.Node.build(wrapped)
    models.Page.build(wrapped)
    models.List.build(wrapped)

    return wrapped
  }

  const builder: SchemaBuilder<Context> = {
    type: SCHEMABUILDER,
    models,
    model: <Type>(modelName: string, service: Service<Type>) => {
      const model = createModelBuilder<Context, Type>(modelName, service || {})
      models[modelName] = model
      return addNodeAttrs(model.interface('Node'))
    },
    interface: <Type>(interfaceName: string, service: Service<Type>) =>
      builder.model<Type>(interfaceName, service).setInterface(),
    build: (context: Context | FieldDefinition) => {
      const fields = isFieldDefinition(context)
        ? context
        : builder.fields(context)
      return new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields: fields.query,
        }),
        mutation: new GraphQLObjectType({
          name: 'Mutation',
          fields: fields.mutation,
        }),
        subscription: new GraphQLObjectType({
          name: 'Subscription',
          fields: fields.subscription,
        }),
      })
    },
    fields: (context: Context | null = null) => {
      const wrapped = setup(context)
      return reduceFields(models, {
        query: queryFieldsReducer(wrapped),
        mutation: mutationFieldsReducer(wrapped),
        subscription: subscriptionFieldsReducer(wrapped),
      })
    },
    setGenericType: (key, type) => {
      generics[key] = type
      return builder
    },
    getGenericType: key => generics[key],
  }

  return builder
}

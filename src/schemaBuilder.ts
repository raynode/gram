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
  ListType,
  ModelBuilder,
  NodeType,
  PageData,
  SchemaBuilder,
  Service,
  Wrapped,
} from './types'

import { v4 as uuid } from 'uuid'
import {
  mutationFieldsReducer,
  queryFieldsReducer,
  subscriptionFieldsReducer,
} from './field-reducers'
import { SCHEMABUILDER } from './types/constants'

const wrapContext = <Context>(context: Context | null): Wrapped<Context> => {
  const models: Record<string, ContextModel<Context, any>> = {}
  return {
    id: uuid(),
    context,
    addModel: (name, model) => (models[name] = model),
    getModel: name => models[name],
  }
}

type BaseTypes = 'Page' | 'Node' | 'List'

export const createSchemaBuilder = <Context = any>(): SchemaBuilder<
  Context
> => {
  const addNodeAttrs = (model: ModelBuilder<Context, any>) => {
    model.attr('id', GraphQLID)
    model.attr('createdAt', GraphQLString)
    model.attr('updatedAt', GraphQLString)
    model.attr('deletedAt', GraphQLString)
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
    build: (context: Context | null = null) => {
      const wrapped = wrapContext<Context>(context)
      forEach(models, model => model.setup(wrapped))

      models.Node.build(wrapped)
      models.Page.build(wrapped)
      models.List.build(wrapped)

      const mutationFields: GraphQLFieldConfigMap<any, any> = reduce(
        models,
        mutationFieldsReducer(wrapped),
        {},
      )
      const queryFields: GraphQLFieldConfigMap<any, any> = reduce(
        models,
        queryFieldsReducer(wrapped),
        {},
      )
      const subscriptionFields: GraphQLFieldConfigMap<any, any> = reduce(
        models,
        subscriptionFieldsReducer(wrapped),
        {},
      )

      return new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields: queryFields,
        }),
        mutation: new GraphQLObjectType({
          name: 'Mutation',
          fields: mutationFields,
        }),
        subscription: new GraphQLObjectType({
          name: 'Subscription',
          fields: subscriptionFields,
        }),
      })
    },
  }

  return builder
}

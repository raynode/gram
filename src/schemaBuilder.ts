
import {
  GraphQLFieldConfigMap,
  GraphQLInputFieldConfigMap,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLType,
} from 'graphql'
import { forEach, reduce } from 'lodash'
import { createModelBuilder } from 'modelBuilder'
import { ContextMutator, ModelBuilder, SchemaBuilder, Service, Wrapped } from 'types'

import { mutationFieldsReducer, queryFieldsReducer, subscriptionFieldsReducer } from 'field-reducers'

const wrapContext = <Context>(context: Context): Wrapped<Context> => {
  const models = {}
  return {
    context,
    addModel: (name, model) => models[name] = model,
    getModel: name => models[name],
  }
}

type BaseTypes = 'page' | 'node'

export const createSchemaBuilder = <Context>(): SchemaBuilder<Context> => {
  const models: Record<string, ModelBuilder<Context, any>> = {}
  const types: Record<BaseTypes, GraphQLType | ModelBuilder<Context, any>> = {
    node: null,
    page: null,
  }
  const builder: SchemaBuilder<Context> = {
    models,
    model: <Type>(modelName, service: Service<Type> = null, contextFn: ContextMutator<Context, Type> = () => null) => {
      const model = createModelBuilder<Context, Type>(modelName, service, contextFn)
      models[modelName] = model
      return model
    },
    interface: <Type>(interfaceName, service: Service<Type>, contextFn: ContextMutator<Context, Type> = () => null) =>
      builder.model<Type>(interfaceName, service, contextFn).setInterface(),
    build: context => {
      const wrapped = wrapContext<Context>(context)
      forEach(models, model => model.setup(wrapped))

      const mutationFields: GraphQLFieldConfigMap<any, any> = reduce(models, mutationFieldsReducer(wrapped), {})
      const queryFields: GraphQLFieldConfigMap<any, any> = reduce(models, queryFieldsReducer(wrapped), {})
      const subscriptionFields: GraphQLFieldConfigMap<any, any> = reduce(models, subscriptionFieldsReducer(wrapped), {})

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
    setNodeType: nodeType => {
      types.node = nodeType
      return builder
    },
    setPageType: pageType => {
      types.page = pageType
      return builder
    },
  }
  return builder
}

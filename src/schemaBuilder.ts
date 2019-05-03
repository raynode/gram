
import { GraphQLFieldConfigMap, GraphQLInputFieldConfigMap, GraphQLObjectType, GraphQLSchema } from 'graphql'
import { forEach, reduce } from 'lodash'
import { createModelBuilder } from 'modelBuilder'
import { ModelBuilder, SchemaBuilder, Wrapped } from 'types'

import { mutationFieldsReducer, queryFieldsReducer, subscriptionFieldsReducer } from 'field-reducers'

const wrapContext = <Context>(context: Context): Wrapped<Context> => {
  const models = {}
  return {
    context,
    addModel: (name, model) => models[name] = model,
    getModel: name => models[name],
  }
}

export const createSchemaBuilder = <Context>(): SchemaBuilder<Context> => {
  const models: Record<string, ModelBuilder<Context, any>> = {}
  const builder: SchemaBuilder<Context> = {
    models,
    model: <Type>(modelName, contextFn = () => true) => {
      const model = createModelBuilder<Context, Type>(modelName, contextFn)
      models[modelName] = model
      return model
    },
    interface: <Type>(interfaceName, contextFn = () => true) =>
      builder.model<Type>(interfaceName, contextFn).setInterface(),
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
  }
  return builder
}

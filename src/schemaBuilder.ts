
import { GraphQLObjectType, GraphQLSchema } from 'graphql'
import { forEach, reduce } from 'lodash'
import { createModelBuilder } from './modelBuilder'
import { ModelBuilder, SchemaBuilder, Wrapped } from './types'

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
  return {
    models,
    model: <Type>(modelName, contextFn = () => true) => {
      const model = createModelBuilder<Context, Type>(modelName, contextFn)
      models[modelName] = model
      return model
    },
    build: context => {
      const wrapped = wrapContext<Context>(context)
      forEach(models, model => model.setup(wrapped))
      const fields = reduce(models, (fields, model) => {
        const contextModel = model.build(wrapped)
        if(contextModel.visibility.findOneQuery)
          fields[contextModel.names.fields.findOne] = {
            type: contextModel.getType(),
          }
        if(contextModel.visibility.findManyQuery)
          fields[contextModel.names.fields.findMany] = {
            type: contextModel.getListType(),
          }
        return fields
      }, {})

      return new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields,
        }),
      })
    },
  }
}

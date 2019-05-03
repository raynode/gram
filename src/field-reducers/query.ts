
import { GraphQLFieldConfigMap } from 'graphql'
import { reduce } from 'lodash'
import { ContextModel, ModelBuilder, Wrapped } from 'types'

import {
  findMany,
  findOne,
} from 'field-types'

export const queryFieldsReducer = <Context>(context: Wrapped<Context>) => (
  fields: any,
  model: ModelBuilder<Context, any>,
) => {
  const contextModel = model.build(context)
  if(contextModel.visibility.findOneQuery)
    fields[contextModel.names.fields.findOne] = findOne(contextModel)
  if(contextModel.visibility.findManyQuery)
    fields[contextModel.names.fields.findMany] = findMany(contextModel)
  return fields as GraphQLFieldConfigMap<any, any>
}

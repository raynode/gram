
import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql'
import { ContextModel } from 'types'
import { memoizeContextModel } from 'utils'

export const where = memoizeContextModel(contextModel => new GraphQLInputObjectType({
  name: contextModel.names.types.whereType,
  fields: () => contextModel.dataFields('where') as GraphQLInputFieldConfigMap,
}))

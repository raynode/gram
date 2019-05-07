
import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql'
import { memoizeContextModel } from 'utils'

export const filter = memoizeContextModel(contextModel => new GraphQLInputObjectType({
  name: contextModel.names.types.filterType,
  fields: () => contextModel.dataFields('filter') as GraphQLInputFieldConfigMap,
}))

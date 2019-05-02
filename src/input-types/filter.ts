
import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql'
import { memoizeContextModel } from 'utils'
import { ContextModel } from 'types'

export const filter = memoizeContextModel((contextModel: ContextModel) => new GraphQLInputObjectType({
  name: contextModel.names.types.filterType,
  fields: () => contextModel.dataFields('filter') as GraphQLInputFieldConfigMap,
}))

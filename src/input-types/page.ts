
import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql'
import { ContextModel } from 'types'
import { memoizeContextModel } from 'utils'

export const page = memoizeContextModel(contextModel => new GraphQLInputObjectType({
  name: contextModel.names.types.pageType,
  fields: () => contextModel.dataFields('page') as GraphQLInputFieldConfigMap,
}))


import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql'
import { memoizeContextModel } from 'utils'
import { ContextModel } from 'types'

export const page = memoizeContextModel((contextModel: ContextModel) => new GraphQLInputObjectType({
  name: contextModel.names.types.pageType,
  fields: () => contextModel.dataFields('page') as GraphQLInputFieldConfigMap,
}))

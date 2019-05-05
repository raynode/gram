
import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql'
import { ContextModel } from 'types'
import { memoizeContextModel } from 'utils'

export const create = memoizeContextModel(contextModel => new GraphQLInputObjectType({
  name: contextModel.names.types.createType,
  fields: () => contextModel.dataFields('create') as GraphQLInputFieldConfigMap,
}))

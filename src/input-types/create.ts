
import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql'
import { memoizeContextModel } from 'utils'
import { ContextModel } from 'types'

export const create = memoizeContextModel((contextModel: ContextModel) => new GraphQLInputObjectType({
  name: contextModel.names.types.createType,
  fields: () => contextModel.dataFields('create') as GraphQLInputFieldConfigMap,
}))

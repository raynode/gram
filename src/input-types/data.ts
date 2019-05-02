
import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql'
import { ContextModel } from 'types'
import { memoizeContextModel } from 'utils'

export const data = memoizeContextModel((contextModel: ContextModel) => new GraphQLInputObjectType({
  name: contextModel.names.types.dataType,
  fields: () => contextModel.dataFields('data') as GraphQLInputFieldConfigMap,
}))

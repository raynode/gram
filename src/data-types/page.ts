
import { GraphQLInputFieldConfigMap, GraphQLInt } from 'graphql'
import { ContextModel } from 'types'
import { memoizeContextModel } from 'utils'

export const page = memoizeContextModel<GraphQLInputFieldConfigMap>(() => ({
  limit: { type: GraphQLInt },
  offset: { type: GraphQLInt },
}))


import { GraphQLInputFieldConfig, GraphQLInputType } from 'graphql'
import { ContextModelFieldFn } from 'types'
import { toList } from 'utils'

export const remove: ContextModelFieldFn<GraphQLInputFieldConfig> = contextModel => ({
  subscribe: () => contextModel.getPubSub().asyncIterator(contextModel.names.events.delete),
  resolve: ({ node }) => node,
  type: toList(contextModel.getType()) as GraphQLInputType,
})

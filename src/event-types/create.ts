
import { GraphQLInputFieldConfig, GraphQLNonNull } from 'graphql'
import { ContextModelFieldFn } from 'types'

export const create: ContextModelFieldFn<GraphQLInputFieldConfig> = contextModel => ({
  subscribe: () => contextModel.getPubSub().asyncIterator(contextModel.names.events.create),
  resolve: ({ node }) => node,
  type: GraphQLNonNull(contextModel.getType()),
})

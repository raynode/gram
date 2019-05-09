import { GraphQLInputFieldConfig, GraphQLInputType } from 'graphql'
import { ContextModelFieldFn } from '../types'
import { toList } from '../utils'

export const update: ContextModelFieldFn<
  GraphQLInputFieldConfig
> = contextModel => ({
  subscribe: () =>
    contextModel.getPubSub().asyncIterator(contextModel.names.events.update),
  resolve: ({ node }) => node,
  type: toList(contextModel.getType()) as GraphQLInputType,
})


import { GraphQLInputFieldConfig, GraphQLInputType } from 'graphql'
import { order, where } from 'input-types'
import { ContextModelFieldFn } from 'types'
import { memoizeContextModel, toList } from 'utils'

export const remove: ContextModelFieldFn<GraphQLInputFieldConfig> = memoizeContextModel(contextModel => ({
  args: {
    [contextModel.names.arguments.where]: { type: where(contextModel) },
  },
  type: toList(contextModel.getType()) as GraphQLInputType,
}))

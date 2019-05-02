
import { GraphQLInputFieldConfig, GraphQLInputType } from 'graphql'
import { data, where } from 'input-types'
import { ContextModelFieldFn } from 'types'
import { memoizeContextModel, toList } from 'utils'

export const update: ContextModelFieldFn<GraphQLInputFieldConfig> = memoizeContextModel(contextModel => ({
  args: {
    [contextModel.names.arguments.data]: { type: data(contextModel) },
    [contextModel.names.arguments.where]: { type: where(contextModel) },
  },
  type: toList(contextModel.getType()) as GraphQLInputType,
}))


import { GraphQLFieldConfig, GraphQLOutputType } from 'graphql'
import { order, where } from 'input-types'
import { ContextModelFieldFn } from 'types'
import { memoizeContextModel } from 'utils'

export const findOne: ContextModelFieldFn<GraphQLFieldConfig<any, any>> = memoizeContextModel(contextModel => ({
  args: {
    [contextModel.names.arguments.where]: { type: where(contextModel) },
    [contextModel.names.arguments.order]: { type: order(contextModel) },
  },
  type: contextModel.getType() as GraphQLOutputType,
}))

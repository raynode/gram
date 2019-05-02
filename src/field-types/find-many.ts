
import { GraphQLFieldConfig, GraphQLOutputType } from 'graphql'
import { order, page, where } from 'input-types'
import { ContextModelFieldFn } from 'types'
import { memoizeContextModel } from 'utils'

export const findMany: ContextModelFieldFn<GraphQLFieldConfig<any, any>> = memoizeContextModel(contextModel => ({
  args: {
    [contextModel.names.arguments.order]: { type: order(contextModel) },
    [contextModel.names.arguments.page]: { type: page(contextModel) },
    [contextModel.names.arguments.where]: { type: where(contextModel) },
  },
  type: contextModel.getListType() as GraphQLOutputType,
}))


import { GraphQLFieldConfig, GraphQLOutputType } from 'graphql'
import { order, page, where } from 'input-types'
import { memoizeContextModel } from 'utils'

export const findMany = memoizeContextModel<GraphQLFieldConfig<any, any>>(contextModel => ({
  args: {
    [contextModel.names.arguments.order]: { type: order(contextModel) },
    [contextModel.names.arguments.page]: { type: page(contextModel) },
    [contextModel.names.arguments.where]: { type: where(contextModel) },
  },
  type: contextModel.getListType() as GraphQLOutputType,
  resolve: (_, args, context) => contextModel.service.findMany({
    order: null,
    page: null,
    where: args,
  }),
}))

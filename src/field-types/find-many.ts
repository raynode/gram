import { GraphQLNonNull, GraphQLOutputType } from 'graphql'
import { order, page, where } from '../input-types'
import { memoizeContextModel } from '../utils'

export const findMany = memoizeContextModel(buildModeModel => ({
  args: {
    [buildModeModel.names.arguments.order]: { type: order(buildModeModel) },
    [buildModeModel.names.arguments.page]: { type: page(buildModeModel) },
    [buildModeModel.names.arguments.where]: {
      type: GraphQLNonNull(where(buildModeModel)),
    },
  },
  type: buildModeModel.getListType() as GraphQLOutputType,
  resolve: (_, args, context) =>
    buildModeModel.service.findMany({
      order: args[buildModeModel.names.arguments.order] || null,
      page: args[buildModeModel.names.arguments.page] || null,
      where: args[buildModeModel.names.arguments.where],
    }),
}))

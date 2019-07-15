import { GraphQLNonNull, GraphQLOutputType } from 'graphql'
import { order, where } from '../input-types'
import { memoizeContextModel } from '../utils'

export const findOne = memoizeContextModel(buildModeModel => ({
  args: {
    [buildModeModel.names.arguments.where]: {
      type: GraphQLNonNull(where(buildModeModel)),
    },
    [buildModeModel.names.arguments.order]: { type: order(buildModeModel) },
  },
  type: buildModeModel.getType() as GraphQLOutputType,
  resolve: (_, args, buildMode) =>
    buildModeModel.service.findOne({
      where: args[buildModeModel.names.arguments.where],
      order: args[buildModeModel.names.arguments.order] || null,
    }),
}))

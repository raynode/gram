
import { GraphQLNonNull, GraphQLOutputType } from 'graphql'
import { order, where } from 'input-types'
import { memoizeContextModel } from 'utils'

export const findOne = memoizeContextModel(contextModel => ({
  args: {
    [contextModel.names.arguments.where]: { type: GraphQLNonNull(where(contextModel)) },
    [contextModel.names.arguments.order]: { type: order(contextModel) },
  },
  type: contextModel.getType() as GraphQLOutputType,
  resolve: (_, args, context) => contextModel.service.findOne({
    where: args[contextModel.names.arguments.where],
    order: args[contextModel.names.arguments.order] || null,
  }),
}))

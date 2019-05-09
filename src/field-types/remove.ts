import { GraphQLInputType, GraphQLNonNull } from 'graphql'
import { order, where } from '../input-types'
import { memoizeContextModel, toList } from '../utils'

export const remove = memoizeContextModel(contextModel => ({
  args: {
    [contextModel.names.arguments.where]: {
      type: GraphQLNonNull(where(contextModel)),
    },
  },
  type: toList(contextModel.getType()) as GraphQLInputType,
  resolve: (_, args, context) =>
    contextModel.service.remove({
      where: args[contextModel.names.arguments.where],
    }),
}))

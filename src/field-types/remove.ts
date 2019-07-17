import { GraphQLInputType, GraphQLNonNull } from 'graphql'
import { order, where } from '../input-types'
import { memoizeContextModel, toList } from '../utils'

export const remove = memoizeContextModel(buildModeModel => ({
  args: {
    [buildModeModel.names.arguments.where]: {
      type: GraphQLNonNull(where(buildModeModel)),
    },
  },
  type: toList(buildModeModel.getType()) as GraphQLInputType,
  resolve: (_, args, context) => {
    const node = buildModeModel.service.remove({
      where: args[buildModeModel.names.arguments.where],
    })
    buildModeModel.buildMode.pubSub.publish(
      buildModeModel.names.events.delete,
      {
        node,
      },
    )
    return node
  },
}))

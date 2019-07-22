import { GraphQLInputType, GraphQLNonNull } from 'graphql'
import { data, where } from '../input-types'
import { memoizeContextModel, toList } from '../utils'

export const update = memoizeContextModel(buildModeModel => ({
  args: {
    [buildModeModel.names.arguments.data]: {
      type: GraphQLNonNull(data(buildModeModel)),
    },
    [buildModeModel.names.arguments.where]: {
      type: GraphQLNonNull(where(buildModeModel)),
    },
  },
  type: toList(buildModeModel.getType()) as GraphQLInputType,
  resolve: (_, args, context) => {
    const node = buildModeModel.service.update(
      {
        data: args[buildModeModel.names.arguments.data],
        where: args[buildModeModel.names.arguments.where],
      },
      context,
    )
    buildModeModel.buildMode.pubSub.publish(
      buildModeModel.names.events.update,
      {
        node,
      },
    )
    return node
  },
}))

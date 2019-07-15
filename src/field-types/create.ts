import { GraphQLInputType, GraphQLNonNull } from 'graphql'
import { create as createInput } from '../input-types'
import { memoizeContextModel } from '../utils'

export const create = memoizeContextModel(buildModeModel => ({
  args: {
    [buildModeModel.names.arguments.data]: {
      type: GraphQLNonNull(createInput(buildModeModel)),
    },
  },
  type: buildModeModel.getType() as GraphQLInputType,
  resolve: (_, args, buildMode) => {
    const node = buildModeModel.service.create({
      data: args[buildModeModel.names.arguments.data],
    })
    buildModeModel.buildMode.pubSub.publish(
      buildModeModel.names.events.create,
      {
        node,
      },
    )
    return node
  },
}))

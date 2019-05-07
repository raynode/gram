
import { GraphQLInputType, GraphQLNonNull } from 'graphql'
import { create as createInput } from 'input-types'
import { memoizeContextModel } from 'utils'

export const create = memoizeContextModel(contextModel => ({
  args: {
    [contextModel.names.arguments.data]: { type: GraphQLNonNull(createInput(contextModel)) },
  },
  type: contextModel.getType() as GraphQLInputType,
  resolve: (_, args, context) => contextModel.service.create({
    data: args[contextModel.names.arguments.data],
  }),
}))

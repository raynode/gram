
import { GraphQLInputFieldConfig, GraphQLInputType } from 'graphql'
import { create as createInput } from 'input-types'
import { memoizeContextModel } from 'utils'

export const create = memoizeContextModel<GraphQLInputFieldConfig>(contextModel => ({
  args: {
    [contextModel.names.arguments.data]: { type: createInput(contextModel) },
  },
  type: contextModel.getType() as GraphQLInputType,
  resolve: (_, args, context) => contextModel.service.create({
    data: args,
  }),
}))

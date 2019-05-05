
import { GraphQLInputFieldConfig, GraphQLInputType } from 'graphql'
import { data, where } from 'input-types'
import { memoizeContextModel, toList } from 'utils'

export const update = memoizeContextModel<GraphQLInputFieldConfig>(contextModel => ({
  args: {
    [contextModel.names.arguments.data]: { type: data(contextModel) },
    [contextModel.names.arguments.where]: { type: where(contextModel) },
  },
  type: toList(contextModel.getType()) as GraphQLInputType,
  resolve: (_, args, context) => contextModel.service.update({
    data: null,
    where: args,
  }),
}))

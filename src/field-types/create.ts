
import { GraphQLInputFieldConfig, GraphQLInputType } from 'graphql'
import { create as createInput } from 'input-types'
import { ContextModelFieldFn } from 'types'
import { memoizeContextModel } from 'utils'

export const create: ContextModelFieldFn<GraphQLInputFieldConfig> = memoizeContextModel(contextModel => ({
  args: {
    [contextModel.names.arguments.data]: { type: createInput(contextModel) },
  },
  type: contextModel.getType() as GraphQLInputType,
}))


import { GraphQLInt } from 'graphql'
import { memoizeContextModel, toList } from 'utils'

export const list = memoizeContextModel(contextModel => ({
  page: { type: contextModel.context.getModel('Page').getType() },
  nodes: { type: toList(contextModel.getType()) },
}))

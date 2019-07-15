import { GraphQLInt } from 'graphql'
import { memoizeContextModel, toList } from '../utils'

export const list = memoizeContextModel(buildModeModel => ({
  page: { type: buildModeModel.buildMode.getModel('Page').getType() },
  nodes: { type: toList(buildModeModel.getType()) },
}))

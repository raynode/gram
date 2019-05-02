
import {
  GraphQLFieldConfig,
  GraphQLList,
  GraphQLNonNull,
  GraphQLType,
} from 'graphql'
import { memoize, reduce } from 'lodash'

import { ContextModel } from 'types'

export const toList = <Type extends GraphQLType = GraphQLType>(type: Type) =>
  GraphQLNonNull(GraphQLList(GraphQLNonNull(type))) as Type

export const memoizeContextModel = <Result>(fn: (contextModel: ContextModel) => Result) =>
  memoize(fn, (contextModel: ContextModel) => contextModel.id)

export const reduceContextFields = <Type extends Record<string, any>>(
  contextModel: ContextModel,
  base: Type = null,
  reducer: (memo: Type, field: GraphQLFieldConfig<any, any>, name: string) => Type,
) => reduce(contextModel.getFields(), (memo: Type, field, name) => reducer(memo, field, name), base || {})

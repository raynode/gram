
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

export const memoizeContextModel = <Result, Type = any>(fn: (contextModel: ContextModel<Type>) => Result) =>
  memoize(fn, (contextModel: ContextModel<Type>) => contextModel.id)

export const reduceContextFields = <Type extends Record<string, any>>(
  contextModel: ContextModel<Type>,
  base: Type = null,
  reducer: (memo: Type, field: GraphQLFieldConfig<any, any>, name: string) => Type,
) => reduce(contextModel.getFields(), (memo: Type, field, name) => reducer(memo, field, name), base || {})

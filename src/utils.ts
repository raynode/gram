import {
  GraphQLFieldConfig,
  GraphQLList,
  GraphQLNonNull,
  GraphQLType,
  isType,
} from 'graphql'
import { memoize } from 'lodash'

import { buildType } from './attributeBuilder'
import {
  AttributeBuilder,
  ContextFn,
  ContextModel,
  ModelBuilder,
  ModelType,
  PageData,
  Wrapped,
} from './types'

export const record = (service: Record<string, any>) => ({
  exists: (key: string) =>
    service.hasOwnProperty(key) && typeof service[key] === 'function',
})

export type ToContextFnResult<Context> = ContextFn<
  Context,
  GraphQLType | ContextModel<Context, any>
>
export const toContextFn = <Context>(
  type:
    | ModelType<Context>
    | ModelBuilder<Context, any>
    | ContextFn<Context, GraphQLType>,
): ToContextFnResult<Context> => {
  if (typeof type === 'function') return type
  if (isType(type)) return () => type
  return context => context.getModel(type.name)
}

export const toList = <Type extends GraphQLType = GraphQLType>(type: Type) =>
  GraphQLNonNull(GraphQLList(GraphQLNonNull(type))) as Type

export const conditionalNonNull = <Type extends GraphQLType>(
  type: Type,
  nonNull: boolean,
) => (nonNull ? GraphQLNonNull(type) : type)

export const memoizeContextModel = <Context, Result, Type = any>(
  fn: (contextModel: ContextModel<Context, Type>) => Result,
) =>
  memoize(fn, (contextModel: ContextModel<Context, Type>) => contextModel.id)

export const reduceContextFields = <Context, Type extends Record<string, any>>(
  contextModel: ContextModel<Context, Type>,
  base: Type = null,
  reducer: (
    memo: Type,
    attr: AttributeBuilder<Context, Type, any>,
    type: GraphQLType,
    field: ModelType<Context>,
  ) => Type,
) =>
  contextModel
    .getFields()
    .reduce(
      (memo: Type, attr) =>
        reducer(
          memo,
          attr,
          buildType(attr, contextModel.context),
          attr.field(contextModel.context),
        ),
      base || {},
    )

export const createPageType = <Type>(pageData: PageData, nodes: Type[]) => ({
  page: pageData,
  nodes,
})

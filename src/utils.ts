import {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLType,
  isType,
} from 'graphql'
import { identity, map, memoize, pickBy, reduce } from 'lodash'

import { buildType } from './attributeBuilder'
import {
  AttributeBuilder,
  ContextFn,
  ContextModel,
  ContextModelFn,
  DataType,
  ModelBuilder,
  ModelType,
  PageData,
  Wrapped,
} from './types'

export const record = (service: Record<string, any>) => ({
  exists: (key: string) =>
    service.hasOwnProperty(key) && typeof service[key] === 'function',
})

export const clearRecord = (record: Record<string, any>) =>
  pickBy(record, identity)

export type FieldReducerFn<Context> = (
  fields: GraphQLFieldConfigMap<any, any>,
  model: ModelBuilder<Context, any>,
) => GraphQLFieldConfigMap<any, any>

export const fieldsReducer = <Context>(
  reducer: (
    contextModel: ContextModel<Context, any>,
  ) => GraphQLFieldConfigMap<any, any> | GraphQLInputFieldConfigMap,
) => (context: Wrapped<Context>): FieldReducerFn<Context> => (fields, model) =>
  model.isInterface()
    ? fields
    : { ...fields, ...clearRecord(reducer(model.build(context))) }

// this Type construct will ensure that the returned object will have the same keys as
// the input object. It will also convert the properties from ModelBuilder to FieldReducer
export const reduceFields = <
  Context,
  Reducers,
  Models,
  ReducerKeys extends keyof Reducers
>(
  models: Record<string, ModelBuilder<Context, any>>,
  reducers: Record<ReducerKeys, FieldReducerFn<Context>>,
): Record<ReducerKeys, GraphQLFieldConfigMap<any, any>> =>
  reduce(
    reducers,
    (fields, reducer, name) => ({
      ...fields,
      [name]: reduce(models, reducer, {}),
    }),
    {} as any,
  )

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

export type TypeCondition = 'nonnull' | 'list' | 'none'

export const toList = <Type extends GraphQLType = GraphQLType>(type: Type) =>
  GraphQLNonNull(GraphQLList(GraphQLNonNull(type))) as Type

export const conditionalList = <Type extends GraphQLType>(
  type: Type,
  isList: boolean,
) => (isList ? toList(type) : type)

export const conditionalNonNull = <Type extends GraphQLType>(
  type: Type,
  nonNull: boolean,
) => (nonNull ? GraphQLNonNull(type) : type)

export const conditionalType = <Type extends GraphQLType>(
  type: Type,
  condition: TypeCondition,
) =>
  condition === 'list'
    ? toList(type)
    : condition === 'nonnull'
    ? GraphQLNonNull(type)
    : type

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

export const createPageType = <Type>(page: PageData, nodes: Type[]) => ({
  page,
  nodes,
})

interface ContextModelFieldFnConfig {
  iterator: string
  condition: TypeCondition
}
export const createContextModelFieldFn = <Context>(
  configFn: (
    contextModel: ContextModel<Context, any>,
  ) => ContextModelFieldFnConfig,
) => (contextModel: ContextModel<Context, any>) => {
  const { iterator, condition = 'none' } = configFn(contextModel)
  return {
    subscribe: () => contextModel.getPubSub().asyncIterator(iterator),
    resolve: ({ node }) => node,
    type: conditionalType(contextModel.getType() as GraphQLInputType, condition),
  }
}

export const createInputType = <Context>(
  field: DataType,
  nameFn: ContextModelFn<string>,
) =>
  memoizeContextModel(
    contextModel =>
      new GraphQLInputObjectType({
        name: nameFn(contextModel),
        fields: () =>
          contextModel.dataFields(field) as GraphQLInputFieldConfigMap,
      }),
  )

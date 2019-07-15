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
  WithContext,
  Wrapped,
} from './types'

export const isContextFn = <Context, Type>(
  val: any,
): val is ContextFn<Context, Type> => typeof val === 'function'

export const extractData = <Context, Type>(
  data: WithContext<Context, Type>,
) => (buildMode: Wrapped<Context>) =>
  isContextFn(data) ? data(buildMode) : data

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
    buildModeModel: ContextModel<Context, any>,
  ) => GraphQLFieldConfigMap<any, any> | GraphQLInputFieldConfigMap,
) => (buildMode: Wrapped<Context>): FieldReducerFn<Context> => (
  fields,
  model,
) => ({ ...fields, ...clearRecord(reducer(model.build(buildMode))) })

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
  fields: Record<ReducerKeys, GraphQLFieldConfigMap<any, any>>,
): Record<ReducerKeys, GraphQLFieldConfigMap<any, any>> =>
  reduce(
    reducers,
    (fields, reducer, name) => ({
      ...fields,
      [name]: reduce(models, reducer, fields[name]),
    }),
    fields,
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
  return buildMode => buildMode.getModel(type.name)
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

export const memoizeContextModel = <Context = any, Result = any, Type = any>(
  fn: (buildModeModel: ContextModel<Context, Type, any>) => Result,
) =>
  memoize(
    fn,
    (buildModeModel: ContextModel<Context, Type>) => buildModeModel.id,
  )

export const reduceContextFields = <Context, Type extends Record<string, any>>(
  buildModeModel: ContextModel<Context, Type>,
  base: Type = null,
  reducer: (
    memo: Type,
    attr: AttributeBuilder<Context, Type, any>,
    type: GraphQLType,
    field: ModelType<Context>,
  ) => Type,
) =>
  buildModeModel
    .getFields()
    .reduce(
      (memo: Type, attr) =>
        reducer(
          memo,
          attr,
          buildType(attr, buildModeModel.buildMode),
          attr.field(buildModeModel.buildMode),
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
export const createModelFieldFn = <Context>(
  configFn: (
    buildModeModel: ContextModel<Context, any>,
  ) => ContextModelFieldFnConfig,
) => (buildModeModel: ContextModel<Context, any>) => {
  const { iterator, condition = 'none' } = configFn(buildModeModel)
  return {
    subscribe: () => buildModeModel.buildMode.pubSub.asyncIterator(iterator),
    resolve: ({ node }) => node,
    type: conditionalType(
      buildModeModel.getType() as GraphQLInputType,
      condition,
    ),
  }
}

export const createInputType = <Context>(
  field: DataType,
  nameFn: ContextModelFn<string>,
) =>
  memoizeContextModel(
    buildModeModel =>
      new GraphQLInputObjectType({
        name: nameFn(buildModeModel),
        fields: () =>
          buildModeModel.dataFields(field) as GraphQLInputFieldConfigMap,
      }),
  )

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

import { Names } from './strategies/naming'

export const isContextFn = <BuildMode, Type>(
  val: any,
): val is ContextFn<BuildMode, Type> => typeof val === 'function'

export const extractData = <BuildMode, Type>(
  data: WithContext<BuildMode, Type>,
) => (buildMode: Wrapped<BuildMode>) =>
  isContextFn(data) ? data(buildMode) : data

export const record = (service: Record<string, any>) => ({
  exists: (key: string) =>
    service.hasOwnProperty(key) && typeof service[key] === 'function',
})

export const clearRecord = (record: Record<string, any>) =>
  pickBy(record, identity)

export type FieldReducerFn<BuildMode> = (
  fields: GraphQLFieldConfigMap<any, any>,
  model: ModelBuilder<BuildMode, any>,
) => GraphQLFieldConfigMap<any, any>

export const fieldsReducer = <BuildMode>(
  reducer: (
    buildModeModel: ContextModel<BuildMode, any>,
  ) => GraphQLFieldConfigMap<any, any> | GraphQLInputFieldConfigMap,
) => (buildMode: Wrapped<BuildMode>): FieldReducerFn<BuildMode> => (
  fields,
  model,
) => ({ ...fields, ...clearRecord(reducer(model.build(buildMode))) })

// this Type construct will ensure that the returned object will have the same keys as
// the input object. It will also convert the properties from ModelBuilder to FieldReducer
export const reduceFields = <
  BuildMode,
  Reducers,
  Models,
  ReducerKeys extends keyof Reducers
>(
  models: Record<string, ModelBuilder<BuildMode, any>>,
  reducers: Record<ReducerKeys, FieldReducerFn<BuildMode>>,
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

export type ToContextFnResult<BuildMode> = ContextFn<
  BuildMode,
  GraphQLType | ContextModel<BuildMode, any>
>
export const toContextFn = <BuildMode>(
  type:
    | ModelType<BuildMode>
    | ModelBuilder<BuildMode, any>
    | ContextFn<BuildMode, GraphQLType>,
): ToContextFnResult<BuildMode> => {
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

export const memoizeContextModel = <BuildMode = any, Result = any, Type = any>(
  fn: (buildModeModel: ContextModel<BuildMode, Type, any>) => Result,
) =>
  memoize(
    fn,
    (buildModeModel: ContextModel<BuildMode, Type>) => buildModeModel.id,
  )

export const reduceContextFields = <
  BuildMode,
  Type extends Record<string, any>
>(
  buildModeModel: ContextModel<BuildMode, Type>,
  base: Type = null,
  reducer: (
    memo: Type,
    attr: AttributeBuilder<BuildMode, Type, any>,
    type: GraphQLType,
    field: ModelType<BuildMode>,
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
export const createModelFieldFn = <BuildMode>(
  configFn: (
    buildModeModel: ContextModel<BuildMode, any>,
  ) => ContextModelFieldFnConfig,
) => (buildModeModel: ContextModel<BuildMode, any>) => {
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

export const createInputType = <
  BuildMode,
  Key extends keyof Names,
  Name extends keyof Names[Key]
>(
  field: DataType,
  nameType: Key,
  name: Name,
) =>
  memoizeContextModel(
    buildModeModel =>
      new GraphQLInputObjectType({
        name: (buildModeModel.names[nameType] as Record<any, string>)[
          name
        ] as string,
        fields: () =>
          buildModeModel.dataFields(field) as GraphQLInputFieldConfigMap,
      }),
  )

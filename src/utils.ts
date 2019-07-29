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

export const record = (service: Record<string, any>) => ({
  exists: (key: string) =>
    service.hasOwnProperty(key) && typeof service[key] === 'function',
})

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

export const toList = <Type extends GraphQLType = GraphQLType>(type: Type) =>
  GraphQLNonNull(GraphQLList(GraphQLNonNull(type))) as Type

export const conditionalNonNull = <Type extends GraphQLType>(
  type: Type,
  nonNull: boolean,
) => (nonNull ? GraphQLNonNull(type) : type)

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

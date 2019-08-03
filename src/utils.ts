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
  NodeType,
  PageData,
  WithContext,
  Wrapped,
} from './types'

import { Names } from './strategies/naming'

import { Fields, FieldType } from './createBuild/types'

export const record = (service: Record<string, any>) => ({
  exists: (key: string) =>
    service.hasOwnProperty(key) && typeof service[key] === 'function',
})

export type ToContextFnResult<BuildMode> = ContextFn<
  BuildMode,
  FieldType<any, any>
>
export const toContextFn = <BuildMode>(
  type:
    | string
    | ModelType<BuildMode>
    | ModelBuilder<BuildMode, any>
    | ContextFn<BuildMode, GraphQLType>,
): ToContextFnResult<BuildMode> => {
  if (typeof type === 'string') return () => ({ type })
  if (typeof type === 'function')
    return buildMode => ({ type: type(buildMode) })
  if (isType(type)) return () => ({ type })
  return buildMode => ({
    type: buildMode.getModel(type.name).getType(),
  })
}

export const toList = <Type extends GraphQLType = GraphQLType>(type: Type) =>
  GraphQLNonNull(GraphQLList(GraphQLNonNull(type))) as Type

export const conditionalNonNull = <Type extends GraphQLType>(
  type: Type,
  nonNull: boolean,
) => (nonNull ? GraphQLNonNull(type) : type)

export const memoizeContextModel = <
  BuildMode = any,
  Result = any,
  Type extends NodeType = any
>(
  fn: (buildModeModel: ContextModel<BuildMode, Type, any>) => Result,
) =>
  memoize(
    fn,
    (buildModeModel: ContextModel<BuildMode, Type>) => buildModeModel.id,
  )

export const reduceContextFields = <BuildMode, Type extends NodeType>(
  buildModeModel: ContextModel<BuildMode, Type>,
  base: Type = null,
  reducer: (
    memo: Type,
    attr: AttributeBuilder<BuildMode, Type, any>,
    type: string | GraphQLType,
    field: FieldType<any, any>,
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
) => (name: string, fields: Fields<any, any>) => {
  console.log('createInputType: buildModeModel', field, name, fields)
  return null
  // return new GraphQLInputObjectType({
  //   name: (buildModeModel.names[nameType] as Record<any, string>)[
  //     name
  //   ] as string,
  //   fields: () =>
  //     buildModeModel.dataFields(field) as GraphQLInputFieldConfigMap,
  // })
}

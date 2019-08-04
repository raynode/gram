import { IFieldResolver } from 'graphql-tools'
import {
  isAddEnumTypeConfig,
  isAddInputTypeConfig,
  isAddInterfaceTypeConfig,
  isAddObjectTypeConfig,
  isAddScalarTypeConfig,
  isBuildModeGenerator,
} from './guards'
import {
  BuildModeArgsGenerator,
  BuildModeGenerator,
  CreateableTypes,
  Fields,
  SimpleFieldType,
} from './types'

export type Definable<BuildMode, Data> =
  | Data
  | BuildModeGenerator<BuildMode, Data>
export type DefinableFields<BuildMode, Source, Context> = Definable<
  BuildMode,
  Record<string, SimpleFieldType<Source, Context>>
>

export interface AddScalarTypeConfig {
  type?: 'scalar'
  serialize?: (value: any) => any
  parseValue?: (value: any) => any
  parseLiteral?: (valueAST: any) => any
}
export interface AddInterfaceTypeConfig<BuildMode, Source, Context> {
  type: 'interface'
  fields: DefinableFields<BuildMode, Source, Context>
  resolver?: Record<string, IFieldResolver<Source, Context>>
}
export interface AddInputTypeConfig<BuildMode, Source, Context> {
  type: 'input'
  fields: DefinableFields<BuildMode, Source, Context>
  resolver?: Record<string, IFieldResolver<Source, Context>>
}
export interface AddEnumTypeConfig<BuildMode, Source, Context> {
  type?: 'enum'
  values: Definable<BuildMode, string[]>
}
export interface AddObjectTypeConfig<BuildMode, Source, Context> {
  type?: 'type'
  fields: DefinableFields<BuildMode, Source, Context>
  interface?: Definable<BuildMode, string>
  resolver?: Record<string, IFieldResolver<Source, Context>>
}

export type Adder<ConfigType> = (typeName: string, config: ConfigType) => void

export type AddInterfaceType<BuildMode, Source, Context> = Adder<
  AddInterfaceTypeConfig<BuildMode, Source, Context>
>
export type AddInterfaceWrappedType<BuildMode, Source, Context> = Adder<
  Wrapped<BuildMode, AddInterfaceTypeConfig<BuildMode, Source, Context>>
>
export type AddInputType<BuildMode, Source, Context> = Adder<
  AddInputTypeConfig<BuildMode, Source, Context>
>
export type AddInputWrappedType<BuildMode, Source, Context> = Adder<
  Wrapped<BuildMode, AddInputTypeConfig<BuildMode, Source, Context>>
>
export type AddEnumType<BuildMode, Source, Context> = Adder<
  AddEnumTypeConfig<BuildMode, Source, Context>
>
export type AddEnumWrappedType<BuildMode, Source, Context> = Adder<
  Wrapped<BuildMode, AddEnumTypeConfig<BuildMode, Source, Context>>
>
export type AddObjectType<BuildMode, Source, Context> = Adder<
  AddObjectTypeConfig<BuildMode, Source, Context>
>
export type AddObjectWrappedType<BuildMode, Source, Context> = Adder<
  Wrapped<BuildMode, AddObjectTypeConfig<BuildMode, Source, Context>>
>

export type AddScalarType = (
  typeName: string,
  //  type: 'scalar',
  config?: AddScalarTypeConfig,
) => void

export type AddTypeConfig<BuildMode, Source, Context> =
  | AddInterfaceTypeConfig<BuildMode, Source, Context>
  | AddInputTypeConfig<BuildMode, Source, Context>
  | AddEnumTypeConfig<BuildMode, Source, Context>
  | AddObjectTypeConfig<BuildMode, Source, Context>
  | AddScalarTypeConfig

export type Wrapped<BuildMode, Result> = (buildMode: BuildMode) => Result
export type WrappedOrNot<BuildMode, Result> =
  | Wrapped<BuildMode, Result>
  | Result
export const isWrapped = <BuildMode, Result>(
  fn: any,
): fn is Wrapped<BuildMode, Result> => typeof fn === 'function'

export const unwrap = <BuildMode, Result>(
  buildMode: BuildMode,
  param: WrappedOrNot<BuildMode, Result>,
) => (isWrapped(param) ? param(buildMode) : param)

export type AddType<BuildMode, Source, Context> = AddInterfaceType<
  BuildMode,
  Source,
  Context
> &
  AddInterfaceWrappedType<BuildMode, Source, Context> &
  AddInputType<BuildMode, Source, Context> &
  AddInputWrappedType<BuildMode, Source, Context> &
  AddEnumType<BuildMode, Source, Context> &
  AddEnumWrappedType<BuildMode, Source, Context> &
  AddObjectType<BuildMode, Source, Context> &
  AddObjectWrappedType<BuildMode, Source, Context> &
  AddScalarType

export const createAddType = <BuildMode, Source, Context>(
  buildMode: BuildMode,
  addScalarType: AddScalarType,
  addInterfaceType: AddInterfaceType<BuildMode, Source, Context>,
  addInputType: AddInputType<BuildMode, Source, Context>,
  addEnumType: AddEnumType<BuildMode, Source, Context>,
  addObjectType: AddObjectType<BuildMode, Source, Context>,
): AddType<BuildMode, Source, Context> => (
  typeName: string,
  wrappedConfig = {},
) => {
  const config = unwrap(buildMode, wrappedConfig)
  if (isAddScalarTypeConfig(config)) return addScalarType(typeName, config)
  if (isAddEnumTypeConfig(config)) return addEnumType(typeName, config)
  if (isAddInterfaceTypeConfig(config))
    return addInterfaceType(typeName, config)
  if (isAddInputTypeConfig(config)) return addInputType(typeName, config)
  if (isAddObjectTypeConfig(config)) return addObjectType(typeName, config)
  throw new Error(
    `Could not determine type for ${typeName} with configuration of ${JSON.stringify(
      config,
    )}`,
  )
}

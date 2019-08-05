import { GraphQLSchema, GraphQLType } from 'graphql'
import { IFieldResolver, IResolvers, ITypeDefinitions } from 'graphql-tools'

import { GQLBUILDER } from '../types/constants'

import { AddObjectTypeConfig, createAddType } from './method-addType'

// Context == GraphQLContext ({ user: {…}, db: DBConnection })
// BuildMode == BuildMode of the build ('user' | 'admin')

export interface TypeDefs {
  typeDefs: ITypeDefinitions
  resolvers: IResolvers
}
export interface Build<BuildMode, Context> {
  type: typeof GQLBUILDER
  buildMode: BuildMode
  addMutation: AddResolvable<BuildMode, Context>
  addQuery: AddResolvable<BuildMode, Context>
  addResolver: <Source>(
    base: string,
    name: string,
    resolver: AddResolvableConfig<Source, Context>,
  ) => void
  addSubscription: AddResolvable<BuildMode, Context>
  addType: ReturnType<typeof createAddType>
  extendType: <Source>(
    typeName: string,
    config: AddObjectTypeConfig<BuildMode, Source, Context>,
  ) => void
  isScalar: (type: string) => boolean
  isType: (type: string) => boolean
  toSchema: () => GraphQLSchema
  toTypeDefs: () => TypeDefs
  getState: () => any
}

export type GQLRecord = Record<string, string | GraphQLType>
export type Resolvers = IResolvers
export type BuildModeGenerator<BuildMode, Result> = (
  buildMode?: BuildMode,
) => Result
export type BuildModeArgsGenerator<BuildMode, Args, Result = void> = (
  buildModeGenerator: BuildModeGenerator<BuildMode, Args>,
) => Result
export interface FieldType<Source, Context> {
  args?: GQLRecord
  type: string | GraphQLType
  resolver?: IFieldResolver<Source, Context>
}
export type SimpleFieldType<Source, Context> =
  | string
  | GraphQLType
  | FieldType<Source, Context>
export type Fields<Source, Context> = Record<string, FieldType<Source, Context>>

export interface CreateableTypeConfig<Source, Context> {
  fields: Fields<Source, Context>
}

export type Resolvables = 'Query' | 'Mutation' | 'Subscription'
export type ResolvablesRecord<Source, Context> = Record<
  Resolvables,
  CreateableTypeConfig<Source, Context>
>
export interface ObjectTypesRecordConfig<Source, Context>
  extends CreateableTypeConfig<Source, Context> {
  interface?: string
}
// tslint:disable-next-line:no-empty-interface
export interface InterfaceTypesRecordConfig<Source, Context>
  extends CreateableTypeConfig<Source, Context> {}

export interface InputTypesRecordConfig<Source, Context>
  extends CreateableTypeConfig<Source, Context> {
  interface?: string
}
export interface EnumTypesRecordConfig {
  values: string[]
}
export interface CreateableTypesRecord<Source, Context> {
  scalar: string[]
  type: Record<string, ObjectTypesRecordConfig<Source, Context>>
  interface: Record<string, InterfaceTypesRecordConfig<Source, Context>>
  input: Record<string, InputTypesRecordConfig<Source, Context>>
  enum: Record<string, EnumTypesRecordConfig>
}
export type CreateableTypes<Source, Context> = keyof CreateableTypesRecord<
  Source,
  Context
>

// string === scalar
export type AnyCreateableTypeConfig<Source, Context> =
  | string
  | ObjectTypesRecordConfig<Source, Context>
  | InterfaceTypesRecordConfig<Source, Context>
  | InputTypesRecordConfig<Source, Context>
  | EnumTypesRecordConfig

export interface AddResolvableConfig<Source, Context> {
  args?: GQLRecord
  resolver?: IFieldResolver<Source, Context>
  subscribe?: () => any
  resolve?: () => any
}
export type AddResolvable<BuildMode, Context> = (<Source>(
  name: string,
  type: SimpleFieldType<Source, Context>,
  config?: any,
) => void) &
  (<Source>(
    name: string,
    type: BuildModeGenerator<BuildMode, SimpleFieldType<Source, Context>>,
    config?: any,
  ) => void)

export type AddResolver<Context> = <Source>(
  base: string,
  name: string,
  config: AddResolvableConfig<Source, Context>,
) => void

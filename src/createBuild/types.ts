import { GraphQLResolveInfo, GraphQLSchema, GraphQLType } from 'graphql'
import { IResolvers, ITypeDefinitions, MergeInfo } from 'graphql-tools'

import { GQLBUILDER } from '../types/constants'

import { AddObjectTypeConfig, createAddType } from './method-addType'

// Context == GraphQLContext ({ user: {…}, db: DBConnection })
// BuildMode == BuildMode of the build ('user' | 'admin')

/// replaces the FieldResolver to have a ResultType as well
export type GraphQLFieldResolver<Source, Args, Context, Result> = (
  source: Source,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo & { mergeInfo: MergeInfo },
) => Result

export type MaybeGenerated<Type, BuildMode> =
  | Type
  | BuildModeGenerator<BuildMode, Type>

export type MaybeGeneratedSimpleFieldType<
  BuildMode,
  Source,
  Context
> = MaybeGenerated<SimpleFieldType<Source, Context>, BuildMode>

export interface BaseResolvableConfig {
  args?: GQLRecord
}

export interface QueryResolvableConfig<
  Source,
  Context,
  Args = any,
  Result = any
> extends BaseResolvableConfig {
  resolver?: GraphQLFieldResolver<Source, Args, Context, Result>
}
export interface MutationResolvableConfig<
  Source,
  Context,
  Args = any,
  Result = any
> extends BaseResolvableConfig {
  resolver?: GraphQLFieldResolver<Source, Args, Context, Result>
}
export interface SubscriptionResolvableConfig<
  Source,
  Context,
  Args = any,
  Result = any
> extends BaseResolvableConfig {
  resolve?: GraphQLFieldResolver<never, Args, Context, Result>
  subscribe?: GraphQLFieldResolver<Source, Args, Context, AsyncIterator<Result>>
}
export type AddResolvable<BuildMode, Context> = ((
  typeName: 'Query',
) => AddQuery<BuildMode, Context>) &
  ((typeName: 'Mutation') => AddMutation<BuildMode, Context>) &
  ((typeName: 'Subscription') => AddSubscription<BuildMode, Context>)
export type AddQuery<BuildMode, Context> = <Source, Args = any, Result = any>(
  name: string,
  type: MaybeGeneratedSimpleFieldType<BuildMode, Source, Context>,
  config?: QueryResolvableConfig<Source, Context, Args, Result>,
) => void
export type AddSubscription<BuildMode, Context> = <
  Source,
  Args = any,
  Result = any
>(
  name: string,
  type: MaybeGeneratedSimpleFieldType<BuildMode, Source, Context>,
  config: SubscriptionResolvableConfig<Source, Context, Args, Result>,
) => void
export type AddMutation<BuildMode, Context> = <
  Source,
  Args = any,
  Result = any
>(
  name: string,
  type: MaybeGeneratedSimpleFieldType<BuildMode, Source, Context>,
  config: MutationResolvableConfig<Source, Context, Args, Result>,
) => void

export type AddResolvableConfig<Source, Context, Args = any, Result = any> =
  | QueryResolvableConfig<Source, Context, Args, Result>
  | SubscriptionResolvableConfig<Source, Context, Args, Result>
  | MutationResolvableConfig<Source, Context, Args, Result>

export interface TypeDefs {
  typeDefs: ITypeDefinitions
  resolvers: IResolvers
}
export interface Build<BuildMode, Context> {
  type: typeof GQLBUILDER
  buildMode: BuildMode
  addMutation: AddMutation<BuildMode, Context>
  addQuery: AddQuery<BuildMode, Context>
  addResolver: <Source>(
    base: string,
    name: string,
    resolver: AddResolvableConfig<Source, Context>,
  ) => void
  addSubscription: AddSubscription<BuildMode, Context>
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
export interface FieldType<Source, Context, Args = any, Result = any> {
  args?: GQLRecord
  type: string | GraphQLType
  resolver?: GraphQLFieldResolver<Source, Args, Context, Result>
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

export type AddResolver<Context> = <Source>(
  base: string,
  name: string,
  config: AddResolvableConfig<Source, Context>,
) => void

import { GraphQLSchema, GraphQLType } from 'graphql'
import { IFieldResolver, IResolvers, ITypeDefinitions } from 'graphql-tools'

import { GQLBUILDER } from '../types/constants'

import { createAddType } from './method-addType'

// Context == GraphQLContext ({ user: {…}, db: DBConnection })
// BuildMode == BuildMode of the build ('user' | 'admin')

export interface TypeDefs {
  typeDefs: ITypeDefinitions
  resolvers: IResolvers
}
export interface Build<BuildMode, Context> {
  type: typeof GQLBUILDER
  buildMode: BuildMode
  addQuery: AddResolvable<BuildMode, Context>
  addMutation: AddResolvable<BuildMode, Context>
  addSubscription: AddResolvable<BuildMode, Context>
  addType: ReturnType<typeof createAddType>
  toSchema: () => GraphQLSchema
  toTypeDefs: () => TypeDefs
  getState: () => any
}

export interface CreateableTypeConfig {
  fields: Fields
  interface?: string
}

export type GQLRecord = Record<string, string | GraphQLType>
export type Resolvers = IResolvers
export type BuildModeGenerator<BuildMode, Result> = (
  buildMode?: BuildMode,
) => Result
export type BuildModeArgsGenerator<BuildMode, Args, Result = void> = (
  buildModeGenerator: BuildModeGenerator<BuildMode, Args>,
) => Result
export interface FieldType {
  args?: GQLRecord
  type: string | GraphQLType
}
export type SimpleFieldType = string | GraphQLType | FieldType
export type Fields = Record<string, FieldType>

export type Resolvables = 'Query' | 'Mutation' | 'Subscription'
export type ResolvablesRecord = Record<Resolvables, CreateableTypeConfig>
export interface ObjectTypesRecordConfig extends CreateableTypeConfig {
  interface: string
}
// tslint:disable-next-line:no-empty-interface
export interface InterfaceTypesRecordConfig extends CreateableTypeConfig {}
// tslint:disable-next-line:no-empty-interface
export interface InputTypesRecordConfig extends CreateableTypeConfig {}
export interface EnumTypesRecordConfig {
  values: string[]
}
export interface CreateableTypesRecord {
  scalar: string[]
  type: Record<string, ObjectTypesRecordConfig>
  interface: Record<string, InterfaceTypesRecordConfig>
  input: Record<string, InputTypesRecordConfig>
  enum: Record<string, EnumTypesRecordConfig>
}
export type CreateableTypes = keyof CreateableTypesRecord

export interface AddResolvableConfig<Source, Context, Resolver> {
  args?: GQLRecord
  resolver?: Resolver
  subscribe?: () => any
  resolve?: () => any
}
export type AddResolvable<BuildMode, Context> = (<Source>(
  name: string,
  type: SimpleFieldType,
  config?: any,
) => void) &
  (<Source>(
    name: string,
    type: BuildModeGenerator<BuildMode, SimpleFieldType>,
    config?: any,
  ) => void)

export type AddResolver<Context> = <Source>(
  base: string,
  name: string,
  config: AddResolvableConfig<Source, Context, IFieldResolver<Source, Context>>,
) => void

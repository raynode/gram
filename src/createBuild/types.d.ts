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
export interface Build<BuildMode> {
  type: typeof GQLBUILDER
  buildMode: BuildMode
  addQuery: AddResolvable
  addMutation: AddResolvable
  addSubscription: AddResolvable
  addType: ReturnType<typeof createAddType>
  toSchema: () => GraphQLSchema
  toTypeDefs: () => TypeDefs
}

export type GQLRecord = Record<string, string>
export type Resolvers = IResolvers
export type BuildModeGenerator<BuildMode, Result> = (
  buildMode?: BuildMode,
) => Result
export type BuildModeArgsGenerator<BuildMode, Args, Result = void> = (
  buildModeGenerator: BuildModeGenerator<BuildMode, Args>,
) => Result
export type FieldType = string | GraphQLType
export type Fields = Record<string, FieldType>

export type Resolvables = 'Query' | 'Mutation' | 'Subscription'
export interface ObjectTypesRecordConfig {
  fields: GQLRecord
  interface: string
}
export interface InterfaceTypesRecordConfig {
  fields: GQLRecord
}
export interface InputTypesRecordConfig {
  fields: GQLRecord
}
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

export type AddResolvable = (<Source, Context, Type = FieldType>(
  name: string,
  type: Type,
  resolver?: IFieldResolver<Source, Context>,
) => void) &
  (<BuildMode, Source, Context, Type = FieldType>(
    name: string,
    type: BuildModeGenerator<BuildMode, Type>,
    resolver?: BuildModeGenerator<BuildMode, IFieldResolver<Source, Context>>,
  ) => void)

export type AddResolver<Context> = <Source>(
  base: string,
  name: string,
  resolver: IFieldResolver<Source, Context>,
) => void

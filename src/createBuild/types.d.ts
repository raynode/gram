import { GraphQLType } from 'graphql'
import { IFieldResolver, IResolvers, ITypeDefinitions } from 'graphql-tools'

export type GQLRecord = Record<string, string>
export type Resolver<Source, Context> = IFieldResolver<Source, Context>
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
export interface CreateableTypesRecord {
  scalar: string[]
  type: Record<string, GQLRecord>
  interface: Record<string, GQLRecord>
  input: Record<string, GQLRecord>
}
export type CreateableTypes = keyof CreateableTypesRecord

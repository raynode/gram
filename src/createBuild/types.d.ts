import { GraphQLType } from 'graphql'
import { IFieldResolver, IResolvers, ITypeDefinitions } from 'graphql-tools'

// Context == GraphQLContext ({ user: {…}, db: DBConnection })
// BuildMode == BuildMode of the build ('user' | 'admin')

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

export type AddResolvable = (<Source, Context, Type = FieldType>(
  name: string,
  type: Type,
  resolver?: Resolver<Source, Context>,
) => void) &
  (<BuildMode, Source, Context, Type = FieldType>(
    name: string,
    type: BuildModeGenerator<BuildMode, Type>,
    resolver?: BuildModeGenerator<BuildMode, Resolver<Source, Context>>,
  ) => void)

export type AddResolver<Context> = <Source>(
  base: string,
  name: string,
  resolver: Resolver<Source, Context>,
) => void

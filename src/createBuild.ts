import { GraphQLType } from 'graphql'
import {
  IFieldResolver,
  IResolvers,
  makeExecutableSchema,
} from 'graphql-tools'
import { isEmpty, reduce } from 'lodash'

type GQLRecord = Record<string, string>
type Resolver<Source, Context> = IFieldResolver<Source, Context>
type Resolvers = IResolvers
type BuildModeGenerator<BuildMode, Result> = (buildMode?: BuildMode) => Result
type Resolvables = 'Query' | 'Mutation' | 'Subscription'

const isBuildModeGenerator = <BuildMode, Result>(
  val: any,
): val is BuildModeGenerator<BuildMode, Result> => typeof val === 'function'

export const typeToString = <Type>(type: Type) => {
  return type.toString()
}

const buildData = (data: GQLRecord) =>
  reduce(
    data,
    (list, type, name) => {
      list.push(`${name}: ${type}`)
      return list
    },
    [],
  ).join('\n')

const generateData = (typeName: Resolvables, data: GQLRecord) => `
  type ${typeName} {
    ${buildData(data)}
  }
`

const generateNonEmpty = (typeName: Resolvables, data: GQLRecord) =>
  isEmpty(data) ? '' : generateData(typeName, data)

export const generateTypeDefs = (
  resolvables: Record<Resolvables, GQLRecord>,
  types,
) => {
  if (isEmpty(resolvables.Query)) throw new Error('Query cannot be empty')

  const typeDefs = `
    ${generateData('Query', resolvables.Query)}
    ${generateNonEmpty('Mutation', resolvables.Mutation)}
    ${generateNonEmpty('Subscription', resolvables.Subscription)}
  `
  return typeDefs
}

export const createBuild = <BuildMode = null, Context = any>(
  buildMode?: BuildMode,
) => {
  const resolvables: Record<Resolvables, GQLRecord> = {
    Mutation: {},
    Query: {},
    Subscription: {},
  }
  const types: Record<string, GQLRecord> = {}
  const resolvers: Resolvers = {}
  const addResolver = <Source>(
    base: string,
    name: string,
    resolver: Resolver<Source, Context>,
  ) => {
    resolvers[base] = resolvers[base] || {}
    resolvers[base][name] = resolver
  }

  type AddResolvable = (<Source, Type = string | GraphQLType>(
    name: string,
    type: Type,
    resolver?: Resolver<Source, Context>,
  ) => void) &
    (<Source, Type = string | GraphQLType>(
      name: string,
      type: BuildModeGenerator<BuildMode, Type>,
      resolver?: BuildModeGenerator<BuildMode, Resolver<Source, Context>>,
    ) => void)

  const createResolvable = (typeName: Resolvables): AddResolvable => (
    name,
    type,
    resolver?,
  ) => {
    if (isBuildModeGenerator<BuildMode, string | GraphQLType>(type)) {
      resolvables[typeName][name] = typeToString(type(buildMode))
      addResolver('Query', name, resolver(buildMode))
    } else {
      resolvables[typeName][name] = typeToString(type)
      addResolver('Query', name, resolver)
    }
  }
  const builder = {
    builder: 'Build',
    buildMode,
    addQuery: createResolvable('Query'),
    addMutation: createResolvable('Mutation'),
    addSubscription: createResolvable('Subscription'),
    addType: () => null,
    toSchema: () => makeExecutableSchema(builder.toTypeDefs()),
    toTypeDefs: () => ({
      typeDefs: generateTypeDefs(resolvables, types),
      resolvers,
    }),
  }
  return builder
}

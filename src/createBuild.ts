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

const generateData = (typeName: string, data: GQLRecord) => `
  type ${typeName} {
    ${buildData(data)}
  }
`

const generateNonEmpty = (typeName: string, data: GQLRecord) =>
  isEmpty(data) ? '' : generateData(typeName, data)

export const generateTypeDefs = (queries, mutations, subscriptions, types) => {
  if (isEmpty(queries)) throw new Error('Query cannot be empty')

  const typeDefs = `
    ${generateData('Query', queries)}
    ${generateNonEmpty('Mutation', mutations)}
    ${generateNonEmpty('Subscription', subscriptions)}
  `
  return typeDefs
}

export const createBuild = <BuildMode = null, Context = any>(
  buildMode?: BuildMode,
) => {
  const queries: GQLRecord = {}
  const mutations: GQLRecord = {}
  const subscriptions: GQLRecord = {}
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

  type AddQuery = (<Source, Type = string | GraphQLType>(
    name: string,
    type: Type,
    resolver?: Resolver<Source, Context>,
  ) => void) &
    (<Source, Type = string | GraphQLType>(
      name: string,
      type: BuildModeGenerator<BuildMode, Type>,
      resolver?: BuildModeGenerator<BuildMode, Resolver<Source, Context>>,
    ) => void)

  const addQuery: AddQuery = (name, type, resolver?) => {
    if (isBuildModeGenerator<BuildMode, string | GraphQLType>(type)) {
      const x = type(buildMode)
      const y = typeToString(x)
      queries[name] = y
      addResolver('Query', name, resolver(buildMode))
    } else {
      queries[name] = typeToString(type)
      addResolver('Query', name, resolver)
    }
  }
  const builder = {
    builder: 'Build',
    buildMode,
    addQuery,
    addMutation: () => null,
    addSubscription: () => null,
    addType: () => null,
    toSchema: () => makeExecutableSchema(builder.toTypeDefs()),
    toTypeDefs: () => {
      const typeDefs = generateTypeDefs(
        queries,
        mutations,
        subscriptions,
        types,
      )
      return { typeDefs, resolvers }
    },
  }
  return builder
}

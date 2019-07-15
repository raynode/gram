import { makeExecutableSchema } from 'graphql-tools'

import { generateTypeDefs } from './generateTypeDefs'
import { createAddType } from './method-addType'
import { resolvablesCreator } from './method-resolvablesCreator'
import {
  Build,
  CreateableTypesRecord,
  GQLRecord,
  Resolvables,
  Resolver,
  Resolvers,
} from './types'
import { createBuildModeResolver, fieldsToGQLRecord } from './utils'

import { GQLBUILDER } from '../types/constants'

export const createBuild = <BuildMode = null, Context = any>(
  buildMode?: BuildMode,
) => {
  const resolvables: Record<Resolvables, GQLRecord> = {
    Mutation: {},
    Query: {},
    Subscription: {},
  }
  const types: CreateableTypesRecord = {
    input: {},
    interface: {},
    scalar: [],
    type: {},
  }
  const resolvers: Resolvers = {}
  const addResolver = <Source>(
    base: string,
    name: string,
    resolver: Resolver<Source, Context>,
  ) => {
    resolvers[base] = resolvers[base] || {}
    resolvers[base][name] = resolver
  }

  const createResolvable = resolvablesCreator<BuildMode, Context>(
    buildMode,
    resolvables,
    addResolver,
  )

  const buildModeResolver = createBuildModeResolver(buildMode)
  const addType = createAddType(
    buildMode,
    typeName => types.scalar.push(typeName),
    (typeName, createAble, fields) =>
      (types[createAble][typeName] = fieldsToGQLRecord(
        buildModeResolver(fields),
      )),
  )

  const builder: Build<BuildMode> = {
    type: GQLBUILDER,
    buildMode,
    addQuery: createResolvable('Query'),
    addMutation: createResolvable('Mutation'),
    addSubscription: createResolvable('Subscription'),
    addType,
    toSchema: () => makeExecutableSchema(builder.toTypeDefs()),
    toTypeDefs: () => ({
      typeDefs: generateTypeDefs(resolvables, types),
      resolvers,
    }),
  }
  return builder
}

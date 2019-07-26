import { IFieldResolver, makeExecutableSchema } from 'graphql-tools'

import { forEach, identity } from 'lodash'
import { generateTypeDefs } from './generateTypeDefs'
import { createAddType } from './method-addType'
import { resolvablesCreator } from './method-resolvablesCreator'
import {
  AddResolvableConfig,
  AddResolver,
  Build,
  CreateableTypesRecord,
  GQLRecord,
  Resolvables,
  ResolvablesRecord,
  Resolvers,
} from './types'
import { convertSimpleFieldsToFields, createBuildModeResolver } from './utils'

import { GQLBUILDER } from '../types/constants'

export * from './extension-model'
export * from './types'

export const createBuild = <BuildMode = null, Context = any>(
  buildMode?: BuildMode,
) => {
  const resolvables: ResolvablesRecord<any, Context> = {
    Mutation: {
      fields: {},
    },
    Query: {
      fields: {},
    },
    Subscription: {
      fields: {},
    },
  }
  const types: CreateableTypesRecord<any, Context> = {
    enum: {},
    input: {},
    interface: {},
    scalar: [],
    type: {},
  }
  const resolvers: Resolvers = {}
  const state = {
    resolvables,
    types,
    resolvers,
  }
  const addResolver: AddResolver<Context> = (
    base,
    name,
    { args, resolver },
  ) => {
    resolvers[base] = resolvers[base] || {}
    resolvers[base][name] = resolver
  }

  const addResolvers = <Source>(
    base: string,
    resolvers: Record<
      string,
      IFieldResolver<Source, Context> | AddResolvableConfig<Source, Context>
    >,
  ) =>
    forEach(resolvers, (resolver, name) =>
      addResolver(
        base,
        name,
        typeof resolver === 'function' ? { resolver } : resolver,
      ),
    )

  const createResolvable = resolvablesCreator<BuildMode, any, Context>(
    buildMode,
    resolvables,
    addResolver,
  )

  const buildModeResolver = createBuildModeResolver(buildMode)
  const addInterfaceOrInputType = (typeName, createAble, config) =>
    (types[createAble][typeName] = {
      ...config,
      fields: convertSimpleFieldsToFields(buildModeResolver(config.fields)),
    })

  const addType = createAddType<BuildMode, any, Context>(
    buildMode,
    (typeName, createAble, config = {}) => {
      resolvers[typeName] = {
        serialize: config.serialize || identity,
        parseValue: config.parseValue || identity,
        parseLiteral: config.parseLiteral || (ast => ast.value),
      }
      return types.scalar.push(typeName)
    },
    addInterfaceOrInputType,
    addInterfaceOrInputType,
    (typeName, createAble, config) =>
      (types.enum[typeName] = { values: buildModeResolver(config.values) }),
    (typeName, createAble, config) => {
      if (config.resolver) addResolvers(typeName, config.resolver)
      return (types.type[typeName] = {
        fields: convertSimpleFieldsToFields(buildModeResolver(config.fields)),
        interface: buildModeResolver(config.interface),
      })
    },
  )

  const builder: Build<BuildMode, Context> = {
    type: GQLBUILDER,
    buildMode,
    addMutation: createResolvable('Mutation'),
    addQuery: createResolvable('Query'),
    addResolver,
    addSubscription: createResolvable('Subscription'),
    addType,
    toSchema: () =>
      makeExecutableSchema({
        ...builder.toTypeDefs(),
        resolverValidationOptions: {
          requireResolversForResolveType: false,
        },
      }),
    toTypeDefs: () => ({
      typeDefs: generateTypeDefs(resolvables, types),
      resolvers,
    }),
    getState: () => state,
  }
  return builder
}

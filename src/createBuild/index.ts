import { IFieldResolver, makeExecutableSchema } from 'graphql-tools'

import { generateTypeDefs } from './generateTypeDefs'
import { createAddType } from './method-addType'
import { resolvablesCreator } from './method-resolvablesCreator'
import {
  AddResolver,
  Build,
  CreateableTypesRecord,
  GQLRecord,
  Resolvables,
  ResolvablesRecord,
  Resolvers,
} from './types'
import {
  convertSimpleFieldsToFields,
  createBuildModeResolver,
  fieldsToGQLRecord,
} from './utils'

import { GQLBUILDER } from '../types/constants'

export * from './extension-model'

export const createBuild = <BuildMode = null, Context = any>(
  buildMode?: BuildMode,
) => {
  const resolvables: ResolvablesRecord = {
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
  const types: CreateableTypesRecord = {
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

  const createResolvable = resolvablesCreator<BuildMode, Context>(
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

  const addType = createAddType(
    buildMode,
    typeName => types.scalar.push(typeName),
    addInterfaceOrInputType,
    addInterfaceOrInputType,
    (typeName, createAble, config) =>
      (types.enum[typeName] = { values: buildModeResolver(config.values) }),
    (typeName, createAble, config) =>
      (types.type[typeName] = {
        fields: convertSimpleFieldsToFields(buildModeResolver(config.fields)),
        interface: buildModeResolver(config.interface),
      }),
  )

  const builder: Build<BuildMode, Context> = {
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
    getState: () => state,
  }
  return builder
}

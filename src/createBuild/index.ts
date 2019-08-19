import { IFieldResolver, makeExecutableSchema } from 'graphql-tools'

import { forEach, identity } from 'lodash'
import { generateTypeDefs } from './generateTypeDefs'
import { AddObjectTypeConfig, createAddType } from './method-addType'
import { resolvablesCreator } from './method-resolvablesCreator'
import {
  AddMutation,
  AddQuery,
  AddResolvable,
  AddResolvableConfig,
  AddResolver,
  AddSubscription,
  Build,
  CreateableTypesRecord,
  GQLRecord,
  MutationResolvableConfig,
  QueryResolvableConfig,
  Resolvables,
  ResolvablesRecord,
  Resolvers,
  SubscriptionResolvableConfig,
} from './types'
import {
  convertSimpleFieldsToFields,
  createBuildModeResolver,
  simpleFieldTypeToFieldType,
} from './utils'

import { GQLBUILDER } from '../types/constants'

import { isSubscriptionResolvableConfig } from './guards'

export * from './extension-model'
export * from './types'

export const createBuild = <BuildMode = null, Context = any>(
  buildMode?: BuildMode,
) => {
  const resolvables: ResolvablesRecord<any, Context> = {
    Mutation: { fields: {} },
    Query: { fields: {} },
    Subscription: { fields: {} },
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
  const addResolver: AddResolver<Context> = (base, name, config) => {
    resolvers[base] = resolvers[base] || {}
    const resolver = isSubscriptionResolvableConfig(config)
      ? { resolve: config.resolve, subscribe: config.subscribe }
      : config.resolver
    if (resolver) resolvers[base][name] = resolver
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

  const buildModeResolver = createBuildModeResolver(buildMode)
  const addInterfaceOrInputType = (createable: string) => (typeName, config) =>
    (types[createable][typeName] = {
      ...config,
      fields: convertSimpleFieldsToFields(buildModeResolver(config.fields)),
    })

  const addType = createAddType<BuildMode, any, Context>(
    buildMode,
    (typeName, config = {}) => {
      resolvers[typeName] = {
        serialize: config.serialize || identity,
        parseValue: config.parseValue || identity,
        parseLiteral: config.parseLiteral || (ast => ast.value),
      }
      return types.scalar.push(typeName)
    },
    addInterfaceOrInputType('interface'),
    addInterfaceOrInputType('input'),
    (typeName, config) =>
      (types.enum[typeName] = { values: buildModeResolver(config.values) }),
    (typeName, config) => {
      if (config.resolver) addResolvers(typeName, config.resolver)
      return (types.type[typeName] = {
        fields: convertSimpleFieldsToFields(buildModeResolver(config.fields)),
        interface: buildModeResolver(config.interface),
      })
    },
  )

  const extendType = <Source>(
    typeName: string,
    config: AddObjectTypeConfig<BuildMode, Source, Context>,
  ) => {
    const baseConfig = types.type[typeName]
    if (!baseConfig)
      throw new Error('Cannot extend an type that is not defined!')
    if (config.resolver) addResolvers(typeName, config.resolver)
    const fields = convertSimpleFieldsToFields(buildModeResolver(config.fields))
    const interfaces = baseConfig.interface
      .split('&')
      .concat((buildModeResolver(config.interface) || '').split('&'))
      .filter(_ => _)
    types.type[typeName] = {
      // adding new fields
      fields: { ...baseConfig.fields, ...fields },
      interface: interfaces.join('&'),
    }
  }

  const addResolvable: AddResolvable<BuildMode, Context> = (
    typeName: 'Query' | 'Mutation' | 'Subscription',
  ) => (name, type, config: AddResolvableConfig<any, any> = {}) => {
    const { args } = config
    const fieldType = simpleFieldTypeToFieldType(buildModeResolver(type))
    if (!fieldType.args && args) fieldType.args = args
    resolvables[typeName].fields[name] = fieldType
    addResolver(typeName, name, config)
  }

  const builder: Build<BuildMode, Context> = {
    type: GQLBUILDER,
    buildMode,
    addMutation: addResolvable('Mutation'),
    // createResolvable('Query')
    addQuery: addResolvable('Query'),
    addResolver,
    addSubscription: addResolvable('Subscription'),
    addType,
    extendType,
    isScalar: type =>
      ['String', 'Int', 'Float', 'ID'].includes(type) ||
      types.scalar.includes(type),
    isType: type => Object.keys(types.type).includes(type),
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

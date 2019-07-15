import { GraphQLType } from 'graphql'
import {
  IFieldResolver,
  IResolvers,
  ITypeDefinitions,
  makeExecutableSchema,
} from 'graphql-tools'
import { isEmpty, map, reduce } from 'lodash'
import {
  AddResolvable,
  AddResolver,
  BuildModeArgsGenerator,
  BuildModeGenerator,
  CreateableTypes,
  CreateableTypesRecord,
  Fields,
  FieldType,
  GQLRecord,
  Resolvables,
  Resolver,
  Resolvers,
} from './types'

import {
  AddNonScalarTypeArgs,
  AddScalarTypeArgs,
  ScalarOrNonScalarTypeArgs,
} from './method-types'

import {
  AddNonScalarType,
  AddScalarType,
  createAddType,
} from './method-addType'

import { generateTypeDefs } from './generateTypeDefs'

import { isBuildModeGenerator } from './guards'

import { fieldsToGQLRecord, typeToString } from './utils'

const buildData = (data: GQLRecord) =>
  reduce(
    data,
    (list, type, name) => {
      list.push(`${name}: ${type}`)
      return list
    },
    [],
  ).join('\n')

const createBuildModeResolver = <BuildMode>(buildMode: BuildMode) => <Result>(
  data: Result | BuildModeGenerator<BuildMode, Result>,
) => (isBuildModeGenerator<BuildMode, Result>(data) ? data(buildMode) : data)

const resolvablesCreator = <BuildMode, Context>(
  buildMode: BuildMode,
  resolvables: Record<Resolvables, GQLRecord>,
  addResolver: AddResolver<Context>,
) => {
  const resolveBuildModeGenerator = createBuildModeResolver(buildMode)
  return (typeName: Resolvables): AddResolvable => (name, type, resolver) => {
    if (isBuildModeGenerator<BuildMode, FieldType>(type)) {
      resolvables[typeName][name] = typeToString(
        resolveBuildModeGenerator(type),
      )
      addResolver(
        typeName,
        name,
        resolveBuildModeGenerator<Resolver<any, any>>(resolver),
      )
    } else {
      resolvables[typeName][name] = typeToString(type)
      addResolver(typeName, name, resolver)
    }
  }
}

export const createBuild = <BuildMode = null, Context = any>(
  buildMode?: BuildMode,
) => {
  type BMGenerator<Result> = BuildModeGenerator<BuildMode, Result>

  const resolveBuildModeGenerator = <Result>(
    data: Result | BMGenerator<Result>,
  ) => (isBuildModeGenerator<BuildMode, Result>(data) ? data(buildMode) : data)

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

  const addType = createAddType(
    buildMode,
    typeName => types.scalar.push(typeName),
    (typeName, createAble, fields) =>
      (types[createAble][typeName] = fieldsToGQLRecord(
        resolveBuildModeGenerator<Fields>(fields),
      )),
  )

  const builder = {
    builder: 'Build',
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

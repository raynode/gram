import {
  AddResolvable,
  AddResolvableConfig,
  AddResolver,
  BuildModeGenerator,
  FieldType,
  GQLRecord,
  Resolvables,
  ResolvablesRecord,
  SimpleFieldType,
} from './types'

import { GraphQLType, isType } from 'graphql'
import { IFieldResolver } from 'graphql-tools'
import { simpleFieldTypeToFieldType } from './utils'

import { isBuildModeGenerator } from './guards'

export const createBuildModeResolver = <BuildMode>(buildMode: BuildMode) => <
  Result
>(
  data: Result | BuildModeGenerator<BuildMode, Result>,
) => (isBuildModeGenerator<BuildMode, Result>(data) ? data(buildMode) : data)

export const resolvablesCreator = <BuildMode, Source, Context>(
  buildMode: BuildMode,
  resolvables: ResolvablesRecord<Source, Context>,
  addResolver: AddResolver<Context>,
) => {
  const resolveBuildModeGenerator = createBuildModeResolver(buildMode)
  return <Resolvable extends Resolvables>(
    typeName: Resolvable,
  ): AddResolvable<BuildMode, Context> => (
    name: string,
    simpleFieldType: any,
    configOrResolver: any,
  ) => {
    const { args = {}, resolver = null, resolve, subscribe } =
      typeof configOrResolver === 'function'
        ? {
            args: {},
            resolver: configOrResolver,
            resolve: null,
            subscribe: null,
          }
        : {
            args: resolveBuildModeGenerator(configOrResolver.args),
            resolver: configOrResolver.resolver,
            resolve: configOrResolver.resolve,
            subscribe: configOrResolver.subscribe,
          }
    const fieldType = simpleFieldTypeToFieldType(
      resolveBuildModeGenerator<SimpleFieldType<any, Context>>(simpleFieldType),
    )
    console.log(typeName, resolver)
    if (!fieldType.args && args) fieldType.args = args
    resolvables[typeName].fields[name] = fieldType
    if (typeName === 'Subscription')
      addResolver(typeName, name, {
        subscribe,
        resolve,
      })
    else if (resolver) addResolver(typeName, name, { resolver })
  }
}

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

import { isType } from 'graphql'
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
  return (typeName: Resolvables): AddResolvable<BuildMode, Context> => (
    name: string,
    simpleFieldType: any,
    configOrResolver = {},
  ) => {
    const { args = {}, resolver = null } =
      typeof configOrResolver === 'function'
        ? { args: {}, resolver: configOrResolver }
        : {
            args: resolveBuildModeGenerator(configOrResolver.args),
            resolver: configOrResolver.resolver,
          }
    const fieldType = simpleFieldTypeToFieldType(
      resolveBuildModeGenerator<SimpleFieldType<any, Context>>(simpleFieldType),
    )

    if (!fieldType.args && args) fieldType.args = args
    resolvables[typeName].fields[name] = fieldType
    if (resolver) addResolver(typeName, name, { resolver })
  }
}

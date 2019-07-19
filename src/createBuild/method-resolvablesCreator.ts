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

export const resolvablesCreator = <BuildMode, Context>(
  buildMode: BuildMode,
  resolvables: ResolvablesRecord,
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
            resolver: resolveBuildModeGenerator(configOrResolver.resolver),
          }
    resolvables[typeName].fields[name] = simpleFieldTypeToFieldType(
      resolveBuildModeGenerator<SimpleFieldType>(simpleFieldType),
    )
    addResolver(typeName, name, { args, resolver })
  }
}

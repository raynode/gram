import {
  AddResolvable,
  AddResolvableConfig,
  AddResolver,
  BuildModeGenerator,
  FieldType,
  GQLRecord,
  Resolvables,
} from './types'

import { IFieldResolver } from 'graphql-tools'

import { typeToString } from './utils'

import { isBuildModeGenerator } from './guards'

export const createBuildModeResolver = <BuildMode>(buildMode: BuildMode) => <
  Result
>(
  data: Result | BuildModeGenerator<BuildMode, Result>,
) => (isBuildModeGenerator<BuildMode, Result>(data) ? data(buildMode) : data)

export const resolvablesCreator = <BuildMode, Context>(
  buildMode: BuildMode,
  resolvables: Record<Resolvables, GQLRecord>,
  addResolver: AddResolver<Context>,
) => {
  const resolveBuildModeGenerator = createBuildModeResolver(buildMode)
  return <Source, Context, Type = FieldType>(
    typeName: Resolvables,
  ): AddResolvable => (name: string, type: any, configOrResolver = {}) => {
    const { args = {}, resolver = null } =
      typeof configOrResolver === 'function'
        ? { args: {}, resolver: configOrResolver }
        : {
            args: resolveBuildModeGenerator(configOrResolver.args),
            resolver: resolveBuildModeGenerator(configOrResolver.resolver),
          }
    const config = { args, resolver }
    if (isBuildModeGenerator<BuildMode, FieldType>(type)) {
      resolvables[typeName][name] = typeToString(
        resolveBuildModeGenerator(type),
      )
      addResolver(typeName, name, config)
    } else {
      resolvables[typeName][name] = typeToString(type)
      addResolver(typeName, name, config)
    }
  }
}

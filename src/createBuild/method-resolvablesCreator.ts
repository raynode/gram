import {
  AddResolvable,
  AddResolver,
  BuildModeGenerator,
  FieldType,
  GQLRecord,
  Resolvables,
  Resolver,
} from './types'

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

import {
  BuildModeArgsGenerator,
  BuildModeGenerator,
  CreateableTypes,
  Fields,
} from './types'

import { isBuildModeGenerator } from './guards'

export type AddScalarTypeArgs = [string, 'scalar', never]
export type AddNonScalarTypeArgs = [
  string,
  Exclude<CreateableTypes, 'scalar'>,
  Fields
]
export type ScalarOrNonScalarTypeArgs =
  | [string, 'scalar', Fields]
  | [string, Exclude<CreateableTypes, 'scalar'>, never]

export type AddScalarType = (
  typeName: string,
  type: 'scalar',
  fields?: never,
) => void
export type AddNonScalarType<BuildMode> = (
  typeName: string,
  type: Exclude<CreateableTypes, 'scalar'>,
  fields: Fields | BuildModeGenerator<BuildMode, Fields>,
) => void

export const createAddType = <BuildMode>(
  buildMode: BuildMode,
  addScalarType: AddScalarType,
  addNonScalarType: AddNonScalarType<BuildMode>,
): AddScalarType &
  AddNonScalarType<BuildMode> &
  BuildModeArgsGenerator<
    BuildMode,
    AddScalarTypeArgs | AddNonScalarTypeArgs
  > => (buildModeBenerator, ...args) => {
  const [typeName, type, fields] = isBuildModeGenerator<
    BuildMode,
    AddScalarTypeArgs | AddNonScalarTypeArgs
  >(buildModeBenerator)
    ? buildModeBenerator(buildMode)
    : [buildModeBenerator, ...args]
  return type === 'scalar'
    ? addScalarType(typeName, type)
    : addNonScalarType(typeName, type, fields)
}

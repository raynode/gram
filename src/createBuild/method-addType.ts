import {
  BuildModeArgsGenerator,
  BuildModeGenerator,
  CreateableTypes,
  Fields,
} from './types'

import { isBuildModeGenerator } from './guards'

export type Definable<BuildMode, Data> =
  | Data
  | BuildModeGenerator<BuildMode, Data>
export type DefinableFields<BuildMode> = Definable<BuildMode, Fields>

export type AddScalarArgsType = [string, 'scalar', never]
export type AddInterfaceArgsType<BuildMode> = [
  string,
  'interface',
  { fields: DefinableFields<BuildMode> }
]
export type AddInputArgsType<BuildMode> = [
  string,
  'input',
  { fields: DefinableFields<BuildMode> }
]
export type AddEnumArgsType<BuildMode> = [
  string,
  'enum',
  { values: Definable<BuildMode, string[]> }
]
export type AddObjectArgsType<BuildMode> = [
  string,
  'type',
  {
    fields: DefinableFields<BuildMode>;
    interface?: Definable<BuildMode, string>;
  }
]

export type AddArgs<BuildMode> =
  | AddScalarArgsType
  | AddInterfaceArgsType<BuildMode>
  | AddInputArgsType<BuildMode>
  | AddEnumArgsType<BuildMode>
  | AddObjectArgsType<BuildMode>

export type AddScalarType = (
  typeName: string,
  type: 'scalar',
  config?: {},
) => void
export type AddInterfaceType<BuildMode> = (
  typeName: string,
  type: 'interface',
  config: {
    fields: DefinableFields<BuildMode>;
  },
) => void
export type AddInputType<BuildMode> = (
  typeName: string,
  type: 'input',
  config: {
    fields: DefinableFields<BuildMode>;
  },
) => void
export type AddEnumType<BuildMode> = (
  typeName: string,
  type: 'enum',
  config: {
    values: Definable<BuildMode, string[]>;
  },
) => void
export type AddObjectType<BuildMode> = (
  typeName: string,
  type: 'type',
  config: {
    fields: DefinableFields<BuildMode>;
    interface?: Definable<BuildMode, string>;
  },
) => void

export type AddType<BuildMode> = AddScalarType &
  AddInterfaceType<BuildMode> &
  AddInputType<BuildMode> &
  AddEnumType<BuildMode> &
  AddObjectType<BuildMode>

export type AddArgsGenerator<BuildMode> = BuildModeArgsGenerator<
  BuildMode,
  AddArgs<BuildMode>
>

export const createAddType = <BuildMode>(
  buildMode: BuildMode,
  addScalarType: AddScalarType,
  addInterfaceType: AddInterfaceType<BuildMode>,
  addInputType: AddInputType<BuildMode>,
  addEnumType: AddEnumType<BuildMode>,
  addObjectType: AddObjectType<BuildMode>,
): AddType<BuildMode> & AddArgsGenerator<BuildMode> => (
  buildModeBenerator,
  ...args
) => {
  const typeInformation = isBuildModeGenerator<BuildMode, AddArgs<BuildMode>>(
    buildModeBenerator,
  )
    ? buildModeBenerator(buildMode)
    : ([buildModeBenerator, ...args] as AddArgs<BuildMode>)
  switch (typeInformation[1]) {
    case 'scalar':
      return addScalarType(...typeInformation)
    case 'interface':
      return addInterfaceType(...typeInformation)
    case 'input':
      return addInputType(...typeInformation)
    case 'enum':
      return addEnumType(...typeInformation)
    case 'type':
      return addObjectType(...typeInformation)
  }
}

import { IFieldResolver } from 'graphql-tools'
import { isBuildModeGenerator } from './guards'
import {
  BuildModeArgsGenerator,
  BuildModeGenerator,
  CreateableTypes,
  Fields,
  SimpleFieldType,
} from './types'

export type Definable<BuildMode, Data> =
  | Data
  | BuildModeGenerator<BuildMode, Data>
export type DefinableFields<BuildMode, Source, Context> = Definable<
  BuildMode,
  Record<string, SimpleFieldType<Source, Context>>
>

export type AddScalarArgsType<BuildMode, Source, Context> = [
  string,
  'scalar',
  never
]
export type AddInterfaceArgsType<BuildMode, Source, Context> = [
  string,
  'interface',
  {
    fields: DefinableFields<BuildMode, Source, Context>;
    resolver?: Record<string, IFieldResolver<Source, Context>>;
  }
]
export type AddInputArgsType<BuildMode, Source, Context> = [
  string,
  'input',
  {
    fields: DefinableFields<BuildMode, Source, Context>;
    resolver?: Record<string, IFieldResolver<Source, Context>>;
  }
]
export type AddEnumArgsType<BuildMode, Source, Context> = [
  string,
  'enum',
  { values: Definable<BuildMode, string[]> }
]
export type AddObjectArgsType<BuildMode, Source, Context> = [
  string,
  'type',
  {
    fields: DefinableFields<BuildMode, Source, Context>;
    interface?: Definable<BuildMode, string>;
    resolver?: Record<string, IFieldResolver<Source, Context>>;
  }
]

export type AddArgs<BuildMode, Source, Context> =
  | AddScalarArgsType<BuildMode, Source, Context>
  | AddInterfaceArgsType<BuildMode, Source, Context>
  | AddInputArgsType<BuildMode, Source, Context>
  | AddEnumArgsType<BuildMode, Source, Context>
  | AddObjectArgsType<BuildMode, Source, Context>

export type AddScalarType = (
  typeName: string,
  type: 'scalar',
  config?: {
    serialize?: (value: any) => any;
    parseValue?: (value: any) => any;
    parseLiteral?: (valueAST: any) => any;
  },
) => void
export type AddInterfaceType<BuildMode, Source, Context> = (
  typeName: string,
  type: 'interface',
  config: {
    fields: DefinableFields<BuildMode, Source, Context>;
    resolver?: Record<string, IFieldResolver<Source, Context>>;
  },
) => void
export type AddInputType<BuildMode, Source, Context> = (
  typeName: string,
  type: 'input',
  config: {
    fields: DefinableFields<BuildMode, Source, Context>;
    resolver?: Record<string, IFieldResolver<Source, Context>>;
  },
) => void
export type AddEnumType<BuildMode, Source, Context> = (
  typeName: string,
  type: 'enum',
  config: {
    values: Definable<BuildMode, string[]>;
  },
) => void
export type AddObjectType<BuildMode, Source, Context> = (
  typeName: string,
  type: 'type',
  config: {
    fields: DefinableFields<BuildMode, Source, Context>;
    interface?: Definable<BuildMode, string>;
    resolver?: Record<string, IFieldResolver<Source, Context>>;
  },
) => void

export type AddType<BuildMode, Source, Context> = AddScalarType &
  AddInterfaceType<BuildMode, Source, Context> &
  AddInputType<BuildMode, Source, Context> &
  AddEnumType<BuildMode, Source, Context> &
  AddObjectType<BuildMode, Source, Context>

export type AddArgsGenerator<
  BuildMode,
  Source,
  Context
> = BuildModeArgsGenerator<BuildMode, AddArgs<BuildMode, Source, Context>>

export const createAddType = <BuildMode, Source, Context>(
  buildMode: BuildMode,
  addScalarType: AddScalarType,
  addInterfaceType: AddInterfaceType<BuildMode, Source, Context>,
  addInputType: AddInputType<BuildMode, Source, Context>,
  addEnumType: AddEnumType<BuildMode, Source, Context>,
  addObjectType: AddObjectType<BuildMode, Source, Context>,
): AddType<BuildMode, Source, Context> &
  AddArgsGenerator<BuildMode, Source, Context> => (
  buildModeBenerator,
  ...args
) => {
  const typeInformation = isBuildModeGenerator<
    BuildMode,
    AddArgs<BuildMode, Source, Context>
  >(buildModeBenerator)
    ? buildModeBenerator(buildMode)
    : ([buildModeBenerator, ...args] as AddArgs<BuildMode, Source, Context>)
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

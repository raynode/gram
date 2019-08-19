import {
  AddResolvableConfig,
  BuildModeGenerator,
  CreateableTypeConfig,
  InputTypesRecordConfig,
  InterfaceTypesRecordConfig,
  ObjectTypesRecordConfig,
  SubscriptionResolvableConfig,
} from './types'

import {
  AddEnumTypeConfig,
  AddInputTypeConfig,
  AddInterfaceTypeConfig,
  AddObjectTypeConfig,
  AddScalarTypeConfig,
} from './method-addType'

const hasFields = (val: { fields: any[] }) => !!Object.keys(val.fields).length

export const isBuildModeGenerator = <BuildMode, Result>(
  val: any,
): val is BuildModeGenerator<BuildMode, Result> => typeof val === 'function'

export const isObjectTypesRecordConfig = <Source, Context>(
  val: any,
): val is ObjectTypesRecordConfig<Source, Context> =>
  val.hasOwnProperty('interface')

export const isInterfaceTypesRecordConfig = <Source, Context>(
  val: any,
): val is InterfaceTypesRecordConfig<Source, Context> =>
  !val.hasOwnProperty('interface')

export const isInputTypesRecordConfig = <Source, Context>(
  val: any,
): val is InputTypesRecordConfig<Source, Context> =>
  val.hasOwnProperty('interface')

export const isAddScalarTypeConfig = (val: any): val is AddScalarTypeConfig =>
  // set by type
  (val.hasOwnProperty('type') ? val.type === 'scalar' : true) &&
  // set by missing property
  (!val.hasOwnProperty('fields') && !val.hasOwnProperty('values'))

export const isAddInterfaceTypeConfig = <BuildMode, Source, Context>(
  val: any,
): val is AddInterfaceTypeConfig<BuildMode, Source, Context> =>
  val.hasOwnProperty('type') &&
  val.type === 'interface' &&
  val.hasOwnProperty('fields') &&
  hasFields(val)

export const isAddInputTypeConfig = <BuildMode, Source, Context>(
  val: any,
): val is AddInputTypeConfig<BuildMode, Source, Context> =>
  val.hasOwnProperty('type') &&
  val.type === 'input' &&
  val.hasOwnProperty('fields') &&
  hasFields(val)

export const isAddEnumTypeConfig = <BuildMode, Source, Context>(
  val: any,
): val is AddEnumTypeConfig<BuildMode, Source, Context> =>
  val.hasOwnProperty('values') &&
  !!val.values.length &&
  (val.hasOwnProperty('type') ? val.type === 'enum' : true)

export const isAddObjectTypeConfig = <BuildMode, Source, Context>(
  val: any,
): val is AddObjectTypeConfig<BuildMode, Source, Context> =>
  // set by type
  (val.hasOwnProperty('type') ? val.type === 'type' : true) &&
  // set by property
  val.hasOwnProperty('fields') &&
  hasFields(val)

export const isSubscriptionResolvableConfig = <Source, Context, Args, Result>(
  val: AddResolvableConfig<Source, Context, Args, Result>,
): val is SubscriptionResolvableConfig<Source, Context, Args, Result> =>
  val.hasOwnProperty('subscribe') || val.hasOwnProperty('resolve')

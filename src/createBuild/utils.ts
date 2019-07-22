import { isType } from 'graphql'
import { isEmpty, map, reduce } from 'lodash'
import { isBuildModeGenerator } from './guards'
import {
  BuildModeGenerator,
  Fields,
  FieldType,
  GQLRecord,
  SimpleFieldType,
} from './types'

export const reduceRecord = <Source, Context>(
  fields: Fields<Source, Context>,
) =>
  reduce(
    fields,
    (list, { args = {}, type }, name) => {
      const parameters = isEmpty(args)
        ? ''
        : `(${map(args, (type, arg) => `${arg}: ${type}`)})`
      list.push(`${name}${parameters}: ${type}`)
      return list
    },
    [],
  ).join('\n    ')

export const createBuildModeResolver = <BuildMode>(buildMode: BuildMode) => <
  Result
>(
  data: Result | BuildModeGenerator<BuildMode, Result>,
) => (isBuildModeGenerator<BuildMode, Result>(data) ? data(buildMode) : data)

export const simpleFieldTypeToFieldType = <Source, Context>(
  simpleType: SimpleFieldType<Source, Context>,
): FieldType<Source, Context> => {
  if (isType(simpleType)) return { type: simpleType.toString() }
  if (typeof simpleType === 'string') return { type: simpleType }
  return simpleType
}

export const convertSimpleFieldsToFields = <Source, Context>(
  simpleFields: Record<string, SimpleFieldType<Source, Context>>,
): Fields<Source, Context> =>
  reduce(
    simpleFields,
    (record, simpleField, name) => {
      record[name] = simpleFieldTypeToFieldType(simpleField)
      return record
    },
    {},
  )

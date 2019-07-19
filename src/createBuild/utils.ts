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

export const reduceRecord = (fields: Fields) =>
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

export const simpleFieldTypeToFieldType = (
  simpleType: SimpleFieldType,
): FieldType => {
  if (isType(simpleType)) return { type: simpleType.toString() }
  if (typeof simpleType === 'string') return { type: simpleType }
  return simpleType
}

export const convertSimpleFieldsToFields = (
  simpleFields: Record<string, SimpleFieldType>,
): Fields =>
  reduce(
    simpleFields,
    (record, simpleField, name) => {
      record[name] = simpleFieldTypeToFieldType(simpleField)
      return record
    },
    {},
  )

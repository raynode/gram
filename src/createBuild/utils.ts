import { reduce } from 'lodash'
import { Fields, GQLRecord } from './types'

export const typeToString = <Type>(type: Type) => type.toString()

export const reduceRecord = (gqlData: GQLRecord) =>
  reduce(
    gqlData,
    (list, type, name) => {
      list.push(`${name}: ${type}`)
      return list
    },
    [],
  ).join('\n')

export const fieldsToGQLRecord = (fields: Fields) =>
  reduce(
    fields,
    (record, type, field) => {
      record[field] = typeToString(type)
      return record
    },
    {} as GQLRecord, // tslint:disable-line no-object-literal-type-assertion
  )

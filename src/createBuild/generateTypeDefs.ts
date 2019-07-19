import { ITypeDefinitions } from 'graphql-tools'
import { isEmpty, map, reduce } from 'lodash'
import {
  CreateableTypeConfig,
  CreateableTypes,
  CreateableTypesRecord,
  EnumTypesRecordConfig,
  GQLRecord,
  Resolvables,
  ResolvablesRecord,
} from './types'
import { reduceRecord } from './utils'

const generateCreateableType = (
  createable: string,
  typeName: string,
  config: CreateableTypeConfig,
) => `
  ${createable} ${typeName} ${
  config.interface ? `implements ${config.interface} ` : ''
}{
    ${reduceRecord(config.fields)}
  }
`

const generateNonEmpty = (
  typeName: Resolvables,
  entries: CreateableTypeConfig,
) =>
  isEmpty(entries.fields)
    ? ''
    : generateCreateableType('type', typeName, entries)

const generateEnums = (enums: Record<string, EnumTypesRecordConfig>) =>
  map(
    enums,
    (config, enumName) =>
      `enum ${enumName} { ${config.values.map(value => `${value}`).join(' ')} }`,
  ).join('\n')
const generateScalars = (scalar: string[]) =>
  scalar.map(name => `scalar ${name}`).join('\n')
const generateFields = (
  createable: string,
  createables: Record<string, CreateableTypeConfig>,
) =>
  reduce(
    createables,
    (result, config, typeName) => {
      result.push(generateCreateableType(createable, typeName, config))
      return result
    },
    [],
  ).join('\n')

export const generateTypeDefs = (
  resolvables: ResolvablesRecord,
  types: CreateableTypesRecord,
): ITypeDefinitions => {
  if (isEmpty(resolvables.Query)) throw new Error('Query cannot be empty')

  return `
    ${generateFields('interface', types.interface)}
    ${generateFields('input', types.input)}
    ${generateFields('type', types.type)}
    ${generateEnums(types.enum)}
    ${generateCreateableType('type', 'Query', resolvables.Query)}
    ${generateNonEmpty('Mutation', resolvables.Mutation)}
    ${generateNonEmpty('Subscription', resolvables.Subscription)}
    ${generateScalars(types.scalar)}
  `
}

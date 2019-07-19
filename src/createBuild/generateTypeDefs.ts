import { ITypeDefinitions } from 'graphql-tools'
import { isEmpty, map, reduce } from 'lodash'
import {
  CreateableTypes,
  CreateableTypesRecord,
  EnumTypesRecordConfig,
  GQLRecord,
  Resolvables,
} from './types'
import { reduceRecord } from './utils'

const generateCreateableType = (
  createable: string,
  typeName: string,
  fields: GQLRecord,
  interfaceName?: string,
) => `
  ${createable} ${typeName} ${interfaceName ? `extends ${interfaceName} ` : ''}{
    ${reduceRecord(fields)}
  }
`

const generateNonEmpty = (typeName: Resolvables, data: GQLRecord) =>
  isEmpty(data) ? '' : generateCreateableType('type', typeName, data)

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
  createables: Record<
    string,
    {
      fields: GQLRecord;
      interface?: string;
    }
  >,
) =>
  reduce(
    createables,
    (result, config, typeName) => {
      result.push(
        generateCreateableType(
          createable,
          typeName,
          config.fields,
          config.interface,
        ),
      )
      return result
    },
    [],
  ).join('\n')

export const generateTypeDefs = (
  resolvables: Record<Resolvables, GQLRecord>,
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

import { ITypeDefinitions } from 'graphql-tools'
import { isEmpty, reduce } from 'lodash'
import {
  CreateableTypes,
  CreateableTypesRecord,
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
    ${generateCreateableType('type', 'Query', resolvables.Query)}
    ${generateNonEmpty('Mutation', resolvables.Mutation)}
    ${generateNonEmpty('Subscription', resolvables.Subscription)}
    ${types.scalar.map(name => `scalar ${name}`).join('\n')}
  `
}

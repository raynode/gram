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
  createable: CreateableTypes,
  typeName: string,
  fields: GQLRecord,
) => `
  ${createable} ${typeName} {
    ${reduceRecord(fields)}
  }
`

const generateNonEmpty = (typeName: Resolvables, data: GQLRecord) =>
  isEmpty(data) ? '' : generateCreateableType('type', typeName, data)

const generateCreateables = (
  createable: CreateableTypes,
  createables: Record<string, GQLRecord>,
) =>
  reduce(
    createables,
    (result, fields, typeName) => {
      result.push(generateCreateableType(createable, typeName, fields))
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
    ${generateCreateables('interface', types.interface)}
    ${generateCreateables('input', types.input)}
    ${generateCreateables('type', types.type)}
    ${generateCreateableType('type', 'Query', resolvables.Query)}
    ${generateNonEmpty('Mutation', resolvables.Mutation)}
    ${generateNonEmpty('Subscription', resolvables.Subscription)}
    ${types.scalar.map(name => `scalar ${name}`).join('\n')}
  `
}

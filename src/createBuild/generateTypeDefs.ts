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

const generateCreateableType = <Source, Context>(
  createable: string,
  typeName: string,
  config: CreateableTypeConfig<Source, Context>,
) => {
  // console.log(typeName, config.fields)
  return isEmpty(config.fields)
    ? ''
    : `
  ${createable} ${typeName} ${
        config.interface ? `implements ${config.interface} ` : ''
      }{
    ${reduceRecord(config.fields)}
  }
`
}

const generateNonEmpty = <Source, Context>(
  typeName: Resolvables,
  entries: CreateableTypeConfig<Source, Context>,
) =>
  isEmpty(entries.fields)
    ? ''
    : generateCreateableType('type', typeName, entries)

const generateEnums = (enums: Record<string, EnumTypesRecordConfig>) =>
  map(enums, (config, enumName) => {
    return config.values.length
      ? `enum ${enumName} { ${config.values
          .map(value => `${value}`)
          .join(' ')} }`
      : ''
  }).join('\n')

const generateScalars = (scalar: string[]) =>
  scalar.map(name => `scalar ${name}`).join('\n')

const generateFields = <Source, Context>(
  createable: string,
  createables: Record<string, CreateableTypeConfig<Source, Context>>,
) =>
  reduce(
    createables,
    (result, config, typeName) => {
      result.push(generateCreateableType(createable, typeName, config))
      return result
    },
    [],
  ).join('\n')

export const generateTypeDefs = <Source, Context>(
  resolvables: ResolvablesRecord<Source, Context>,
  types: CreateableTypesRecord<Source, Context>,
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

import { GraphQLEnumType } from 'graphql'
import { flatten, mapKeys, memoize, upperFirst } from 'lodash'
import { createInputType, memoizeContextModel } from './utils'

export const specialCharsMap = new Map([
  ['¼', 'frac14'],
  ['½', 'frac12'],
  ['¾', 'frac34'],
])
export const sanitizeEnumValue = memoize((value: string) =>
  value
    .trim()
    .replace(/([^_a-zA-Z0-9])/g, (_, p) => specialCharsMap.get(p) || ' ')
    .split(' ')
    .map((v, i) => (i ? upperFirst(v) : v))
    .join('')
    .replace(/(^\d)/, '_$1'),
)

export const buildOrderEnumValues = memoizeContextModel(buildModeModel =>
  mapKeys(
    flatten(
      buildModeModel
        .getFields()
        .map(attr => attr.name)
        .map(sanitizeEnumValue)
        .map(name => [`${name}_ASC`, `${name}_DESC`]),
    ).map(value => ({ value })),
    'value',
  ),
)

export const filter = createInputType('filter', 'types', 'filterType')
export const where = createInputType('where', 'types', 'whereType')

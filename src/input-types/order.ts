import { GraphQLEnumType } from 'graphql'
import { flatten, mapKeys, memoize, upperFirst } from 'lodash'
import { memoizeContextModel } from '../utils'

const specialCharsMap = new Map([
  ['¼', 'frac14'],
  ['½', 'frac12'],
  ['¾', 'frac34'],
])
const sanitizeEnumValue = memoize((value: string) =>
  value
    .trim()
    .replace(/([^_a-zA-Z0-9])/g, (_, p) => specialCharsMap.get(p) || ' ')
    .split(' ')
    .map((v, i) => (i ? upperFirst(v) : v))
    .join('')
    .replace(/(^\d)/, '_$1'),
)

const buildOrderEnumValues = memoizeContextModel(buildModeModel =>
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

export const order = memoizeContextModel(
  buildModeModel =>
    new GraphQLEnumType({
      name: buildModeModel.names.types.orderType,
      values: buildOrderEnumValues(buildModeModel),
    }),
)

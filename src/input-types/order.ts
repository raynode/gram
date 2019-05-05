
import { GraphQLEnumType } from 'graphql'
import { Dictionary, flatten, keyBy, map, mapKeys, memoize, upperFirst } from 'lodash'
import { ContextModel } from 'types'
import { memoizeContextModel } from 'utils'

const specialCharsMap = new Map([['¼', 'frac14'], ['½', 'frac12'], ['¾', 'frac34']])
const sanitizeEnumValue = memoize((value: string) => value
  .trim()
  .replace(/([^_a-zA-Z0-9])/g, (_, p) => specialCharsMap.get(p) || ' ')
  .split(' ')
  .map((v, i) => (i ? upperFirst(v) : v))
  .join('')
  .replace(/(^\d)/, '_$1'),
)

const buildOrderEnumValues = memoizeContextModel(contextModel =>
  mapKeys(flatten(Object.keys(contextModel.getFields())
    .map(sanitizeEnumValue)
    .map(name => [`${name}_ASC`, `${name}_DESC`])).map(value => ({ value }),
  ),
  'value',
))

export const order = memoizeContextModel(contextModel => new GraphQLEnumType({
  name: contextModel.names.types.orderType,
  values: buildOrderEnumValues(contextModel),
}))

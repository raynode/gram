import { reduce } from 'lodash'
import {
  booleanAndReduce,
  createFilterStrategy,
  defaultMiddlewares,
  isIdOrString,
  isSpecificType,
  joinReduce,
  objectReduce,
  reduceObject,
} from './filter'

const testTypes = [
  'Int',
  'Float',
  'String',
  'Boolean',
  'ID',
  'Unkown',
  'Int!',
  'Float!',
  'String!',
  'Boolean!',
  'ID!',
  'Unkown!',
  '[Int!]',
  '[Float!]',
  '[String!]',
  '[Boolean!]',
  '[ID!]',
  '[Unkown!]',
  '[Int]',
  '[Float]',
  '[String]',
  '[Boolean]',
  '[ID]',
  '[Unkown]',
  '[Int!]!',
  '[Float!]!',
  '[String!]!',
  '[Boolean!]!',
  '[ID!]!',
  '[Unkown!]!',
]

describe('reducer utilities', () => {
  it('should join boolean functions correctly', () => {
    const isNonNullableListType = booleanAndReduce<(val: string) => boolean>(
      type => /!/.test(type),
      type => /\[.*\]/.test(type),
    )

    expect(testTypes.map(isNonNullableListType)).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      true,
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      true,
      true,
      true,
      true,
      true,
    ])
  })

  it('should merge object results', () => {
    const isInt = isSpecificType('Int')
    const isString = isSpecificType('String')
    const mergeObject = objectReduce<(name: string, type: string) => {}>(
      (name, type) =>
        isInt(type) ? { [`${name}_lt`]: type, [`${name}_gt`]: type } : {},
      (name, type) =>
        isString(type) ? { [`${name}_eq`]: type, [`${name}_neq`]: type } : {},
    )

    expect(mergeObject('strParam', 'String')).toEqual({
      strParam_eq: 'String',
      strParam_neq: 'String',
    })
    expect(mergeObject('intParam', 'Int')).toEqual({
      intParam_lt: 'Int',
      intParam_gt: 'Int',
    })

    const obj = { int: 'Int', str: 'String' }

    const filterReducer = reduceObject(mergeObject, {})
    const expectation = reduce(
      obj,
      (memo, type, key) => ({ ...memo, ...mergeObject(key, type) }),
      {},
    )

    expect(expectation).toEqual(filterReducer(obj))
  })
})

describe('simple filter checks', () => {
  it('should work with isIdOrString', () => {
    expect(isIdOrString('String', false, false, 'String')).toBeTruthy()
    expect(isIdOrString('Int', false, false, 'Int')).toBeFalsy()
  })
})

describe('default middleware for filters', () => {
  it('should convert the input correctly', () => {
    const strategy = createFilterStrategy(defaultMiddlewares)
    expect(strategy('ID', 'id')).toMatchSnapshot()
    expect(strategy('[String!]!', 'non nullable string list')).toMatchSnapshot()
    expect(strategy('[String!]', 'nullable string list')).toMatchSnapshot()
    expect(strategy('[String]', 'string list')).toMatchSnapshot()
    expect(strategy('String', 'string')).toMatchSnapshot()
    expect(strategy('String!', 'non null string')).toMatchSnapshot()
  })
})

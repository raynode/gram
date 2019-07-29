import { reduce } from 'lodash'
import {
  booleanReduce,
  getParentType,
  isListType,
  isNullable,
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

describe('type utilities', () => {
  it('should correctly identify list types', () => {
    const result = testTypes.map(isListType)

    expect(result).toEqual([
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
    ])
  })

  it('should correctly identify nullable types', () => {
    const result = testTypes.map(isNullable)

    expect(result).toEqual([
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

  it('should correctly return parent types', () => {
    const result = testTypes.map(getParentType)

    expect(result).toEqual([
      'Int',
      'Float',
      'String',
      'Boolean',
      'ID',
      'Unkown',
      'Int',
      'Float',
      'String',
      'Boolean',
      'ID',
      'Unkown',
      'Int',
      'Float',
      'String',
      'Boolean',
      'ID',
      'Unkown',
      'Int',
      'Float',
      'String',
      'Boolean',
      'ID',
      'Unkown',
      'Int',
      'Float',
      'String',
      'Boolean',
      'ID',
      'Unkown',
    ])
  })
})

describe('reducer utilities', () => {
  it('should join boolean functions correctly', () => {
    const isNonNullableListType = booleanReduce<(val: string) => boolean>(
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

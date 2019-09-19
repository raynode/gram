import { reduce } from 'lodash'

import * as filters from './filters'
export { filters }

import {
  getParentType,
  isListType,
  isNullable,
  list,
  nonNull,
} from '../createBuild/utils'
import { ContextModel, FilterMiddleware, FilterStrategy } from '../types'

export const isSpecificType = (str: string) => (type: string) => type === str

export type Reducer = <State>(state: State, nextState: State) => State

export const joinReduce = <Result>(initial: Result, reducer: Reducer) => <
  Fn extends (...args: any[]) => Result
>(
  ...fns: Fn[]
) => (...args: Parameters<Fn>) =>
  fns.reduce((memo, fn) => reducer(memo, fn(...args)), initial)

export const booleanAndReduce = joinReduce(true, (memo, next) => memo && next)
export const booleanOrReduce = joinReduce(false, (memo, next) => memo || next)
export const objectReduce = joinReduce({}, (memo, next) => ({
  ...memo,
  ...next,
}))

export const reduceObject = <Val, Result>(
  mapper: (key: string, value: Val) => Result,
  initial: Result,
) => <Obj extends Record<string, Val>>(obj: Obj) =>
  reduce(
    obj,
    (memo, value, key) => ({ ...memo, ...mapper(key, value) }),
    initial,
  )

export const isBooleanType = isSpecificType('Boolean')
export const isIdType = isSpecificType('ID')
export const isStringType = isSpecificType('String')
export const isFloatType = isSpecificType('Float')
export const isIntType = isSpecificType('Int')

export const isListTypeCheck = (parentType, isRequired, ilt, baseType) => ilt
export const isNotListTypeCheck = (parentType, isRequired, ilt, baseType) =>
  !ilt

export const isIdOrString = booleanAndReduce(
  isNotListTypeCheck,
  booleanOrReduce(isIdType, isStringType),
)
export const isNumeric = booleanAndReduce(
  isNotListTypeCheck,
  booleanOrReduce(isFloatType, isIntType),
)
export const isScalarType = booleanOrReduce(
  isBooleanType,
  isIdType,
  isStringType,
  isFloatType,
  isIntType,
)

const { equals, joinFilters, list: listFilter, numeric, record } = filters
export const defaultMiddlewares: FilterMiddleware[] = [
  [isBooleanType, equals],
  [isIdOrString, joinFilters([equals, record])],
  [isNumeric, joinFilters([equals, numeric])],
  [isListTypeCheck, listFilter],
  [(type, required, isList) => isScalarType(type) && isList, listFilter],
]

export const createFilterStrategy = (
  middlewares: FilterMiddleware[],
): FilterStrategy => (baseType: string, inputName?: string) => {
  const parentType = getParentType(baseType)
  const name = inputName || baseType
  const listType = `[${parentType}!]`
  const isRequired = !isNullable(baseType)
  const ilt = isListType(baseType)

  return middlewares.reduce(
    (result, [check, filter]) =>
      check(parentType, isRequired, ilt, baseType)
        ? { ...result, ...filter(name, parentType, listType) }
        : result,
    {},
  )
}

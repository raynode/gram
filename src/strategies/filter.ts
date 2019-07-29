import {
  getNamedType,
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLList,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLType,
  isLeafType,
  isListType as isGraphQLListType,
  isNullableType,
  isScalarType,
  isType,
} from 'graphql'

import { ContextModel, FilterMiddleware, FilterStrategy } from '../types'

import * as filters from './filters'
export { filters }

import { reduce } from 'lodash'

const typeToString = (type: GraphQLType | string) =>
  typeof type === 'string' ? type : type.toString()

export const isListType = (type: string) =>
  type[0] === '[' && type[type.length - 1] === ']'
export const isNullable = (type: string) => type[type.length - 1] === '!'
export const getParentType = (type: string) =>
  isNullable(type)
    ? getParentType(type.substr(0, type.length - 1))
    : isListType(type)
    ? getParentType(type.substr(1, type.length - 2))
    : type

export const isSpecificType = (str: string) => (type: string) => type === str

export type Reducer = <State>(state: State, nextState: State) => State

export const joinReduce = <Result>(initial: Result, reducer: Reducer) => <
  Fn extends (...args: any[]) => Result
>(
  ...fns: Fn[]
) => (...args: Parameters<Fn>) =>
  fns.reduce((memo, fn) => reducer(memo, fn(...args)), initial)

export type Defined<T> = T extends undefined ? never : T
export type MergedProperties<T, U> = {
  [K in keyof T & keyof U]: undefined extends T[K]
    ? Defined<T[K] | U[K]>
    : T[K];
}

export const booleanReduce = joinReduce(true, (memo, next) => memo && next)
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

const hasParentType = (
  type: any,
): type is GraphQLNonNull<any> | GraphQLList<any> =>
  type && type.hasOwnProperty('ofType')

const isNonNullType = (type: GraphQLType): type is GraphQLNonNull<any> =>
  !isNullableType(type)

const getParentGraphQLType = (
  type: GraphQLType | GraphQLNonNull<any> | GraphQLList<any>,
): GraphQLType =>
  hasParentType(type) ? getParentGraphQLType(type.ofType) : type

const isList = (type: GraphQLType): type is GraphQLList<any> =>
  isNonNullType(type) ? isList(type.ofType) : isGraphQLListType(type)

// sadly no correct typescript-guards, as the GraphQL basic types are not real "Types"
export interface GraphQLScalarTypeInstance<T extends string>
  extends GraphQLScalarType {
  name: T
}
export const isSpecificScalarType = <Type extends string>(name: string) => (
  type: GraphQLType,
): type is GraphQLScalarTypeInstance<Type> =>
  isScalarType(type) && type.name === name

export const isGraphQLString = isSpecificScalarType<'String'>('String')
export const isGraphQLBoolean = isSpecificScalarType<'Boolean'>('Boolean')
export const isGraphQLFloat = isSpecificScalarType<'Float'>('Float')
export const isGraphQLInt = isSpecificScalarType<'Int'>('Int')
export const isGraphQLID = isSpecificScalarType<'ID'>('ID')

export const isIdOrString = (type: GraphQLType) =>
  isScalarType(type) && (isGraphQLID(type) || isGraphQLString(type))
export const isNumeric = (type: GraphQLType) =>
  isScalarType(type) && (isGraphQLFloat(type) || isGraphQLInt(type))

const { equals, joinFilters, list, numeric, record } = filters
export const defaultMiddlewares: FilterMiddleware[] = [
  [isGraphQLBoolean, equals],
  [isIdOrString, joinFilters([equals, record])],
  [isNumeric, joinFilters([equals, numeric])],
  [(type, required, isList) => isScalarType(type) && isList, list],
]

export const createFilterStrategy = (
  middlewares: FilterMiddleware[],
): FilterStrategy => <Type extends GraphQLType = GraphQLType>(
  inputType: Type | ContextModel<any, any>,
  inputName?: string,
) => {
  const baseType = isType(inputType) ? inputType : inputType.getType()
  const type = getParentGraphQLType(baseType)
  const name = inputName
    ? inputName
    : isType(inputType)
    ? `F${inputType.toString()}`
    : inputType.name
  const list = GraphQLList(GraphQLNonNull(type))
  const isRequired = !isNullableType(baseType)
  const isListType = isList(baseType)

  return middlewares.reduce(
    (result, [check, filter]) =>
      check(type, isRequired, isListType, baseType)
        ? { ...result, ...filter(name, type.toString(), list.toString()) }
        : result,
    {},
  )
}

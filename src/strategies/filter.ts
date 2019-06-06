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
  isListType,
  isNullableType,
  isScalarType,
  isType,
} from 'graphql'

import { ContextModel, FilterMiddleware, FilterStrategy } from '../types'

import * as filters from './filters'
export { filters }

const hasParentType = (
  type: any,
): type is GraphQLNonNull<any> | GraphQLList<any> =>
  type && type.hasOwnProperty('ofType')

const isNonNullType = (type: GraphQLType): type is GraphQLNonNull<any> =>
  !isNullableType(type)

const getParentType = (
  type: GraphQLType | GraphQLNonNull<any> | GraphQLList<any>,
): GraphQLType => (hasParentType(type) ? getParentType(type.ofType) : type)

const isList = (type: GraphQLType): type is GraphQLList<any> =>
  isNonNullType(type) ? isList(type.ofType) : isListType(type)

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
  const type = getParentType(baseType)
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
        ? { ...result, ...filter(name, type, list) }
        : result,
    {},
  )
}

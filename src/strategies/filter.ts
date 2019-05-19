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
  isScalarType,
  isType,
} from 'graphql'

import { ContextModel, FilterMiddleware } from '../types'
import { equals, joinFilters, list, numeric, record } from './filters'

const hasParentType = (
  type: any,
): type is GraphQLNonNull<any> | GraphQLList<any> =>
  type && type.hasOwnProperty('ofType')

const getParentType = (
  type: GraphQLType | GraphQLNonNull<any> | GraphQLList<any>,
): GraphQLType => (hasParentType(type) ? getParentType(type.ofType) : type)

// sadly no correct typescript-guards, as the GraphQL basic types are not real "Types"
export interface GraphQLScalarTypeInstance<T extends string>
  extends GraphQLScalarType {
  name: T
}
export const isGraphQLString = (
  type: GraphQLScalarType,
): type is GraphQLScalarTypeInstance<'String'> => type.name === 'String'
export const isGraphQLBoolean = (
  type: GraphQLScalarType,
): type is GraphQLScalarTypeInstance<'Boolean'> => type.name === 'Boolean'
export const isGraphQLFloat = (
  type: GraphQLScalarType,
): type is GraphQLScalarTypeInstance<'Float'> => type.name === 'Float'
export const isGraphQLInt = (
  type: GraphQLScalarType,
): type is GraphQLScalarTypeInstance<'Int'> => type.name === 'Int'
export const isGraphQLID = (
  type: GraphQLScalarType,
): type is GraphQLScalarTypeInstance<'ID'> => type.name === 'ID'

export const isIdOrString = (type: GraphQLType) =>
  isScalarType(type) && (isGraphQLID(type) || isGraphQLString(type))
export const isNumeric = (type: GraphQLType) =>
  isScalarType(type) && (isGraphQLFloat(type) || isGraphQLInt(type))

const middlewares: FilterMiddleware[] = [
  [isGraphQLBoolean, equals],
  [isIdOrString, joinFilters([equals, record])],
  [isNumeric, joinFilters([equals, numeric])],
  [isListType, list],
]

export const filterStrategy = <Type extends GraphQLType = GraphQLType>(
  inputType: Type | ContextModel<any, any>,
  inputName?: string,
) => {
  const type = getParentType(
    isType(inputType) ? inputType : inputType.getType(),
  )
  const name = inputName
    ? inputName
    : isType(inputType)
    ? `F${inputType.toString()}`
    : inputType.name
  const list = GraphQLList(GraphQLNonNull(type))

  return middlewares.reduce(
    (result, [check, filter]) =>
      check(type) ? { ...result, ...filter(name, type, list) } : result,
    {},
  )
}

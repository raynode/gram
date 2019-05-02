
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

import { ContextModel } from 'types'

const hasParentType = (type: any): type is GraphQLNonNull<any> | GraphQLList<any> =>
  type && type.hasOwnProperty('ofType')

const getParentType = (type: GraphQLType | GraphQLNonNull<any> | GraphQLList<any>): GraphQLType =>
  hasParentType(type) ? getParentType(type.ofType) : type

// sadly no correct typescript-guards, as the GraphQL basic types are not real "Types"
export interface GraphQLScalarTypeInstance<T extends string> extends GraphQLScalarType {
  name: T
}
export const isGraphQLString = (type: GraphQLScalarType): type is GraphQLScalarTypeInstance<'String'> =>
  type.name === 'String'
export const isGraphQLBoolean = (type: GraphQLScalarType): type is GraphQLScalarTypeInstance<'Boolean'> =>
  type.name === 'Boolean'
export const isGraphQLFloat = (type: GraphQLScalarType): type is GraphQLScalarTypeInstance<'Float'> =>
  type.name === 'Float'
export const isGraphQLInt = (type: GraphQLScalarType): type is GraphQLScalarTypeInstance<'Int'> => type.name === 'Int'
export const isGraphQLID = (type: GraphQLScalarType): type is GraphQLScalarTypeInstance<'ID'> => type.name === 'ID'

export type FilterMapper = <Type extends GraphQLType>(
  contextModel: ContextModel,
) => Record<string, GraphQLFieldConfigMap<any, any>>

export const filterStrategy = <Type extends GraphQLType = GraphQLType>(
  inputType: Type | ContextModel,
  inputName?: string,
) => {
  const type = getParentType(isType(inputType) ? inputType : inputType.getType())
  const name = inputName ? inputName : (isType(inputType) ? `F${inputType.toString()}` : inputType.name)
  const list = GraphQLList(GraphQLNonNull(type))
  if (isScalarType(type)) {
    if (isGraphQLID(type) || isGraphQLString(type))
      return {
        [`${name}`]: { type },
        [`${name}_not`]: { type },
        [`${name}_in`]: { type: list },
        [`${name}_not_in`]: { type: list },
      }
    if (isGraphQLBoolean(type)) return { [`${name}`]: { type } }
    if (isGraphQLFloat(type) || isGraphQLInt(type))
      return {
        [`${name}`]: { type },
        [`${name}_not`]: { type },
        [`${name}_gt`]: { type },
        [`${name}_lt`]: { type },
      }
  }
  if (isListType(type))
    return {
      [`${name}_contains`]: { type },
      [`${name}_not_contains`]: { type },
    }
  return {}
}

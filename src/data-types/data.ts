
import { GraphQLInputFieldConfigMap, GraphQLInputType, isObjectType, isScalarType } from 'graphql'
import { where as whereInput } from 'input-types/where'
import { filterStrategy } from 'strategies/filter'
import { ContextModel } from 'types'
import { memoizeContextModel, reduceContextFields } from 'utils'

export const data = memoizeContextModel(contextModel =>
  reduceContextFields(contextModel, contextModel.baseFilters(), (where, field, name) => ({
    ...where,
    ...(isScalarType(field.type) ? {
      [name]: { type: field.type as GraphQLInputType },
    } : {}),
  })))


import { GraphQLInputFieldConfigMap, isType } from 'graphql'
import { filterStrategy } from 'strategies/filter'
import { memoizeContextModel, reduceContextFields } from 'utils'

export const where = memoizeContextModel(contextModel =>
  reduceContextFields(contextModel, contextModel.baseFilters(), (where, attr, type, field) => ({
    ...where,
    ...filterStrategy(isType(type) ? type : field, attr.name),
  })))

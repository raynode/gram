
import { GraphQLInputFieldConfigMap } from 'graphql'
import { filterStrategy } from 'strategies/filter'
import { ContextModel } from 'types'
import { memoizeContextModel, reduceContextFields } from 'utils'

export const where = memoizeContextModel(contextModel =>
  reduceContextFields(contextModel, contextModel.baseFilters(), (where, field, name) => ({
    ...where,
    ...filterStrategy(field.type, name),
  })))

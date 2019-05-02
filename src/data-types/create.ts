
import { GraphQLInputFieldConfigMap, isType } from 'graphql'
import { filterStrategy } from 'strategies/filter'
import { ContextModel } from 'types'
import { memoizeContextModel, reduceContextFields } from 'utils'

export const create = memoizeContextModel((contextModel: ContextModel): GraphQLInputFieldConfigMap =>
  reduceContextFields(contextModel, contextModel.baseFilters(), (where, field, name) => ({
    ...where,
    ...(isType(field.type) ? filterStrategy(field.type, name) : null),
  })))

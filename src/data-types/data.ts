
import { GraphQLInputFieldConfigMap, GraphQLInputType, isType } from 'graphql'
import { filterStrategy } from 'strategies/filter'
import { ContextModel } from 'types'
import { memoizeContextModel, reduceContextFields } from 'utils'
import { where as whereInput } from 'input-types/where'

export const data = memoizeContextModel((contextModel: ContextModel): GraphQLInputFieldConfigMap =>
  reduceContextFields(contextModel, contextModel.baseFilters(), (where, field, name) => ({
    ...where,
    [name]: { type: isType(field.type) ? field.type as GraphQLInputType : whereInput(contextModel) },
  })))

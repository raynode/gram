import { GraphQLInputFieldConfigMap, isType } from 'graphql'
import { memoizeContextModel, reduceContextFields } from '../utils'

export const where = memoizeContextModel(contextModel =>
  reduceContextFields(
    contextModel,
    contextModel.baseFilters(),
    (where, attr, type, field) => ({
      ...where,
      ...contextModel.context.filterStrategy(
        isType(type) ? type : field,
        attr.name,
      ),
    }),
  ),
)

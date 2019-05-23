import { isType } from 'graphql'
import { memoizeContextModel, reduceContextFields } from '../utils'

export const filter = memoizeContextModel(contextModel =>
  reduceContextFields(
    contextModel,
    contextModel.baseFilters(),
    (where, attr, type, field) => ({
      ...where,
      ...(isType(field)
        ? contextModel.context.filterStrategy(type, attr.name)
        : null),
    }),
  ),
)

import { isType } from 'graphql'
import { memoizeContextModel, reduceContextFields } from '../utils'

export const filter = memoizeContextModel(buildModeModel =>
  reduceContextFields(
    buildModeModel,
    buildModeModel.baseFilters(),
    (where, attr, type, field) => ({
      ...where,
      ...(isType(field)
        ? buildModeModel.buildMode.filterStrategy(type, attr.name)
        : null),
    }),
  ),
)

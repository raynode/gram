import { GraphQLInputFieldConfigMap, isType } from 'graphql'
import { memoizeContextModel, reduceContextFields } from '../utils'

export const where = memoizeContextModel(buildModeModel =>
  reduceContextFields(
    buildModeModel,
    buildModeModel.baseFilters(),
    (where, attr, type, field) => ({
      ...where,
      ...buildModeModel.buildMode.filterStrategy(
        isType(type) ? type : field,
        attr.name,
      ),
    }),
  ),
)

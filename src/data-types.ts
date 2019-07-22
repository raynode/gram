import { GraphQLInt, isType } from 'graphql'

import { where as whereInput } from './input-types'
import {
  conditionalNonNull,
  memoizeContextModel,
  reduceContextFields,
  toList,
} from './utils'

export const create = memoizeContextModel(buildModeModel =>
  reduceContextFields(buildModeModel, {}, (create, attr, type, field) => ({
    ...create,
    [attr.name]: {
      type: isType(field)
        ? type
        : conditionalNonNull(whereInput(field), !attr.nullable),
    },
  })),
)

export const data = memoizeContextModel(buildModeModel =>
  reduceContextFields(buildModeModel, {}, (data, attr, type, field) => ({
    ...data,
    [attr.name]: { type: isType(field) ? type : whereInput(field) },
  })),
)

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

export const list = memoizeContextModel(buildModeModel => ({
  page: { type: buildModeModel.buildMode.getModel('Page').getType() },
  nodes: { type: toList(buildModeModel.getType()) },
}))

export const page = () => ({
  limit: { type: GraphQLInt },
  offset: { type: GraphQLInt },
})

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

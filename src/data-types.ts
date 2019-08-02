import { GraphQLInt, isType } from 'graphql'

import { where as whereInput } from './input-types'
import {
  conditionalNonNull,
  memoizeContextModel,
  reduceContextFields,
  toList,
} from './utils'

import { FieldType } from './createBuild/types'
import { nonNull } from './createBuild/utils'
import { ModelType } from './types'

const fieldTypeToString = <Source, Context>(
  field: FieldType<Source, Context>,
) => (isType(field.type) ? field.type.toString() : field.type)

const fieldConverter = <Source, Context>(
  field: FieldType<Source, Context>,
  nullable = true,
) => (nullable ? fieldTypeToString(field) : nonNull(fieldTypeToString(field)))

export const create = memoizeContextModel(buildModeModel =>
  reduceContextFields(buildModeModel, {}, (create, attr, type, field) => ({
    ...create,
    [attr.name]: fieldConverter(field, attr.nullable),
  })),
)

export const data = memoizeContextModel(buildModeModel =>
  reduceContextFields(buildModeModel, {}, (data, attr, type, field) => ({
    ...data,
    [attr.name]: type,
  })),
)

export const filter = memoizeContextModel(buildModeModel =>
  reduceContextFields(
    buildModeModel,
    buildModeModel.baseFilters,
    (where, attr, type, field) => ({
      ...where,
      ...buildModeModel.buildMode.filterStrategy(type, attr.name),
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

export const fieldToString = <BuildMode>(field: FieldType<any, any>) => {
  if (isType(field.type)) return field.type.toString()
  return field.type
}

export const where = memoizeContextModel(buildModeModel =>
  reduceContextFields(
    buildModeModel,
    buildModeModel.baseFilters,
    (where, attr, type, field) => ({
      ...where,
      ...buildModeModel.buildMode.filterStrategy(
        isType(type) ? type.toString() : fieldToString(field),
        attr.name,
      ),
    }),
  ),
)

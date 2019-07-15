import {
  GraphQLInputFieldConfigMap,
  GraphQLInputType,
  isObjectType,
  isScalarType,
  isType,
} from 'graphql'
import { where } from '../input-types'
import { memoizeContextModel, reduceContextFields } from '../utils'

export const data = memoizeContextModel(buildModeModel =>
  reduceContextFields(buildModeModel, {}, (data, attr, type, field) => ({
    ...data,
    [attr.name]: { type: isType(field) ? type : where(field) },
  })),
)

import { findMany, findOne } from '../field-types'
import { fieldsReducer } from '../utils'

export const queryFieldsReducer = fieldsReducer(contextModel => ({
  [contextModel.names.fields.findOne]:
    contextModel.visibility.findOneQuery && findOne(contextModel),
  [contextModel.names.fields.findMany]:
    contextModel.visibility.findManyQuery && findMany(contextModel),
}))

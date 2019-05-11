import { createInputType } from '../utils'

export const data = createInputType(
  'data',
  contextModel => contextModel.names.types.dataType,
)

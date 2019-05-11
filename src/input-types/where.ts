import { createInputType } from '../utils'

export const where = createInputType(
  'where',
  contextModel => contextModel.names.types.whereType,
)

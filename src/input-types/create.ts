import { createInputType } from '../utils'

export const create = createInputType(
  'create',
  contextModel => contextModel.names.types.createType,
)

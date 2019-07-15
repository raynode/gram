import { createInputType } from '../utils'

export const create = createInputType(
  'create',
  buildModeModel => buildModeModel.names.types.createType,
)

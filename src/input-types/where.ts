import { createInputType } from '../utils'

export const where = createInputType(
  'where',
  buildModeModel => buildModeModel.names.types.whereType,
)

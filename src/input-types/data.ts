import { createInputType } from '../utils'

export const data = createInputType(
  'data',
  buildModeModel => buildModeModel.names.types.dataType,
)

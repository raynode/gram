import { createInputType } from '../utils'

export const filter = createInputType(
  'filter',
  buildModeModel => buildModeModel.names.types.filterType,
)

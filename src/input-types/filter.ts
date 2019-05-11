import { createInputType } from '../utils'

export const filter = createInputType(
  'filter',
  contextModel => contextModel.names.types.filterType,
)

import { createInputType } from '../utils'

export const page = createInputType(
  'page',
  buildModeModel => buildModeModel.names.types.pageType,
)

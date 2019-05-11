import { createInputType } from '../utils'

export const page = createInputType(
  'page',
  contextModel => contextModel.names.types.pageType,
)

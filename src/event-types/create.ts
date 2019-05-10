import { createContextModelFieldFn } from '../utils'

export const create = createContextModelFieldFn(contextModel => ({
  iterator: contextModel.names.events.delete,
  condition: 'nonnull',
}))

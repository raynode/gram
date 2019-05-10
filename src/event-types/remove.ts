import { createContextModelFieldFn } from '../utils'

export const remove = createContextModelFieldFn(contextModel => ({
  iterator: contextModel.names.events.delete,
  condition: 'list',
}))

import { createContextModelFieldFn } from '../utils'

export const create = createContextModelFieldFn(contextModel => ({
  iterator: contextModel.names.events.create,
  condition: 'nonnull',
}))

export const remove = createContextModelFieldFn(contextModel => ({
  iterator: contextModel.names.events.delete,
  condition: 'list',
}))

export const update = createContextModelFieldFn(contextModel => ({
  iterator: contextModel.names.events.update,
  condition: 'list',
}))

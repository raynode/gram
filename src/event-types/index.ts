import { createModelFieldFn } from '../utils'

export const create = createModelFieldFn(contextModel => ({
  iterator: contextModel.names.events.create,
  condition: 'nonnull',
}))

export const remove = createModelFieldFn(contextModel => ({
  iterator: contextModel.names.events.delete,
  condition: 'list',
}))

export const update = createModelFieldFn(contextModel => ({
  iterator: contextModel.names.events.update,
  condition: 'list',
}))

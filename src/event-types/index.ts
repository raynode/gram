import { createModelFieldFn } from '../utils'

export const create = createModelFieldFn(buildModeModel => ({
  iterator: buildModeModel.names.events.create,
  condition: 'nonnull',
}))

export const remove = createModelFieldFn(buildModeModel => ({
  iterator: buildModeModel.names.events.delete,
  condition: 'list',
}))

export const update = createModelFieldFn(buildModeModel => ({
  iterator: buildModeModel.names.events.update,
  condition: 'list',
}))

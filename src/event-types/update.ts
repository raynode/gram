import { createContextModelFieldFn } from '../utils'

export const update = createContextModelFieldFn(contextModel => ({
  iterator: contextModel.names.events.update,
  condition: 'list',
}))

import { create, remove, update } from '../field-types'
import { fieldsReducer } from '../utils'

export const mutationFieldsReducer = fieldsReducer(contextModel => ({
  [contextModel.names.fields.create]:
    contextModel.visibility.createMutation && create(contextModel),
  [contextModel.names.fields.update]:
    contextModel.visibility.updateMutation && update(contextModel),
  [contextModel.names.fields.delete]:
    contextModel.visibility.deleteMutation && remove(contextModel),
}))

import { create, remove, update } from '../event-types'
import { fieldsReducer } from '../utils'

export const subscriptionFieldsReducer = fieldsReducer(contextModel => ({
  [contextModel.names.events.create]:
    contextModel.visibility.createSubscription && create(contextModel),
  [contextModel.names.events.update]:
    contextModel.visibility.updateSubscription && update(contextModel),
  [contextModel.names.events.delete]:
    contextModel.visibility.deleteSubscription && remove(contextModel),
}))

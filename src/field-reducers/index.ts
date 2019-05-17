import * as eventTypes from '../event-types'
import * as fieldTypes from '../field-types'
import { fieldsReducer } from '../utils'

export const subscriptionFieldsReducer = fieldsReducer(contextModel => ({
  [contextModel.names.events.create]:
    contextModel.visibility.createSubscription &&
    eventTypes.create(contextModel),
  [contextModel.names.events.update]:
    contextModel.visibility.updateSubscription &&
    eventTypes.update(contextModel),
  [contextModel.names.events.delete]:
    contextModel.visibility.deleteSubscription &&
    eventTypes.remove(contextModel),
}))

export const mutationFieldsReducer = fieldsReducer(contextModel => ({
  [contextModel.names.fields.create]:
    contextModel.visibility.createMutation && fieldTypes.create(contextModel),
  [contextModel.names.fields.update]:
    contextModel.visibility.updateMutation && fieldTypes.update(contextModel),
  [contextModel.names.fields.delete]:
    contextModel.visibility.deleteMutation && fieldTypes.remove(contextModel),
}))

export const queryFieldsReducer = fieldsReducer(contextModel => ({
  [contextModel.names.fields.findOne]:
    contextModel.visibility.findOneQuery && fieldTypes.findOne(contextModel),
  [contextModel.names.fields.findMany]:
    contextModel.visibility.findManyQuery && fieldTypes.findMany(contextModel),
}))

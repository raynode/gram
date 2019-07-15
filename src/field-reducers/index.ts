import * as eventTypes from '../event-types'
import * as fieldTypes from '../field-types'
import { fieldsReducer } from '../utils'

export const subscriptionFieldsReducer = fieldsReducer(buildModeModel => ({
  [buildModeModel.names.events.create]:
    buildModeModel.visibility.createSubscription &&
    eventTypes.create(buildModeModel),
  [buildModeModel.names.events.update]:
    buildModeModel.visibility.updateSubscription &&
    eventTypes.update(buildModeModel),
  [buildModeModel.names.events.delete]:
    buildModeModel.visibility.deleteSubscription &&
    eventTypes.remove(buildModeModel),
}))

export const mutationFieldsReducer = fieldsReducer(buildModeModel => ({
  [buildModeModel.names.fields.create]:
    buildModeModel.visibility.createMutation &&
    fieldTypes.create(buildModeModel),
  [buildModeModel.names.fields.update]:
    buildModeModel.visibility.updateMutation &&
    fieldTypes.update(buildModeModel),
  [buildModeModel.names.fields.delete]:
    buildModeModel.visibility.deleteMutation &&
    fieldTypes.remove(buildModeModel),
}))

export const queryFieldsReducer = fieldsReducer(buildModeModel => ({
  [buildModeModel.names.fields.findOne]:
    buildModeModel.visibility.findOneQuery &&
    fieldTypes.findOne(buildModeModel),
  [buildModeModel.names.fields.findMany]:
    buildModeModel.visibility.findManyQuery &&
    fieldTypes.findMany(buildModeModel),
}))

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventTypes = require("../event-types");
const fieldTypes = require("../field-types");
const utils_1 = require("../utils");
exports.subscriptionFieldsReducer = utils_1.fieldsReducer(contextModel => ({
    [contextModel.names.events.create]: contextModel.visibility.createSubscription &&
        eventTypes.create(contextModel),
    [contextModel.names.events.update]: contextModel.visibility.updateSubscription &&
        eventTypes.update(contextModel),
    [contextModel.names.events.delete]: contextModel.visibility.deleteSubscription &&
        eventTypes.remove(contextModel),
}));
exports.mutationFieldsReducer = utils_1.fieldsReducer(contextModel => ({
    [contextModel.names.fields.create]: contextModel.visibility.createMutation && fieldTypes.create(contextModel),
    [contextModel.names.fields.update]: contextModel.visibility.updateMutation && fieldTypes.update(contextModel),
    [contextModel.names.fields.delete]: contextModel.visibility.deleteMutation && fieldTypes.remove(contextModel),
}));
exports.queryFieldsReducer = utils_1.fieldsReducer(contextModel => ({
    [contextModel.names.fields.findOne]: contextModel.visibility.findOneQuery && fieldTypes.findOne(contextModel),
    [contextModel.names.fields.findMany]: contextModel.visibility.findManyQuery && fieldTypes.findMany(contextModel),
}));
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_types_1 = require("../event-types");
const utils_1 = require("../utils");
exports.subscriptionFieldsReducer = utils_1.fieldsReducer(contextModel => ({
    [contextModel.names.events.create]: contextModel.visibility.createSubscription && event_types_1.create(contextModel),
    [contextModel.names.events.update]: contextModel.visibility.updateSubscription && event_types_1.update(contextModel),
    [contextModel.names.events.delete]: contextModel.visibility.deleteSubscription && event_types_1.remove(contextModel),
}));
//# sourceMappingURL=subscription.js.map
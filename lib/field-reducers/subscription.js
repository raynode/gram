"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_types_1 = require("event-types");
exports.subscriptionFieldsReducer = (context) => (fields, model) => {
    if (model.isInterface())
        return fields;
    const contextModel = model.build(context);
    if (contextModel.visibility.createSubscription)
        fields[contextModel.names.events.create] = event_types_1.create(contextModel);
    if (contextModel.visibility.updateSubscription)
        fields[contextModel.names.events.update] = event_types_1.update(contextModel);
    if (contextModel.visibility.deleteSubscription)
        fields[contextModel.names.events.delete] = event_types_1.remove(contextModel);
    return fields;
};
//# sourceMappingURL=subscription.js.map
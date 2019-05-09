"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const field_types_1 = require("field-types");
exports.mutationFieldsReducer = (context) => (fields, model) => {
    if (model.isInterface())
        return fields;
    const contextModel = model.build(context);
    if (contextModel.visibility.createMutation)
        fields[contextModel.names.fields.create] = field_types_1.create(contextModel);
    if (contextModel.visibility.updateMutation)
        fields[contextModel.names.fields.update] = field_types_1.update(contextModel);
    if (contextModel.visibility.deleteMutation)
        fields[contextModel.names.fields.delete] = field_types_1.remove(contextModel);
    return fields;
};
//# sourceMappingURL=mutation.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const field_types_1 = require("../field-types");
const utils_1 = require("../utils");
exports.mutationFieldsReducer = utils_1.fieldsReducer(contextModel => ({
    [contextModel.names.fields.create]: contextModel.visibility.createMutation && field_types_1.create(contextModel),
    [contextModel.names.fields.update]: contextModel.visibility.updateMutation && field_types_1.update(contextModel),
    [contextModel.names.fields.delete]: contextModel.visibility.deleteMutation && field_types_1.remove(contextModel),
}));
//# sourceMappingURL=mutation.js.map
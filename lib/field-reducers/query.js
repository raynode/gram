"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const field_types_1 = require("field-types");
exports.queryFieldsReducer = (context) => (fields, model) => {
    if (model.isInterface())
        return fields;
    const contextModel = model.build(context);
    if (contextModel.visibility.findOneQuery)
        fields[contextModel.names.fields.findOne] = field_types_1.findOne(contextModel);
    if (contextModel.visibility.findManyQuery)
        fields[contextModel.names.fields.findMany] = field_types_1.findMany(contextModel);
    return fields;
};
//# sourceMappingURL=query.js.map
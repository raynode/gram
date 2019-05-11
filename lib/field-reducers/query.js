"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const field_types_1 = require("../field-types");
const utils_1 = require("../utils");
exports.queryFieldsReducer = utils_1.fieldsReducer(contextModel => ({
    [contextModel.names.fields.findOne]: contextModel.visibility.findOneQuery && field_types_1.findOne(contextModel),
    [contextModel.names.fields.findMany]: contextModel.visibility.findManyQuery && field_types_1.findMany(contextModel),
}));
//# sourceMappingURL=query.js.map
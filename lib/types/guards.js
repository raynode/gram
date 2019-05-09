"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("types/constants");
exports.isBuilder = (val) => val && typeof val.type === 'string';
exports.isAttributeBuilder = (val) => exports.isBuilder(val) && val.type === constants_1.ATTRIBUTEBUILDER;
exports.isModelBuilder = (val) => exports.isBuilder(val) && val.type === constants_1.MODELBUILDER;
exports.isSchemaBuilder = (val) => exports.isBuilder(val) && val.type === constants_1.SCHEMABUILDER;
//# sourceMappingURL=guards.js.map
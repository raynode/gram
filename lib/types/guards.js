"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const constants_1 = require("../types/constants");
exports.isBuilder = (val) => val && typeof val.type === 'string';
exports.isAttributeBuilder = (val) => exports.isBuilder(val) && val.type === constants_1.ATTRIBUTEBUILDER;
exports.isModelBuilder = (val) => exports.isBuilder(val) && val.type === constants_1.MODELBUILDER;
exports.isSchemaBuilder = (val) => exports.isBuilder(val) && val.type === constants_1.SCHEMABUILDER;
exports.isFieldDefinition = (val) => {
    if (!val || typeof val !== 'object')
        return false;
    return Object.keys(val).reduce((result, key) => result && (typeof val[key] === 'object') && graphql_1.isType(val[key].type), true);
};
//# sourceMappingURL=guards.js.map
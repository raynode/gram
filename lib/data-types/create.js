"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const input_types_1 = require("../input-types");
const utils_1 = require("../utils");
exports.create = utils_1.memoizeContextModel(contextModel => utils_1.reduceContextFields(contextModel, {}, (create, attr, type, field) => (Object.assign({}, create, { [attr.name]: {
        type: graphql_1.isType(field)
            ? type
            : utils_1.conditionalNonNull(input_types_1.where(field), !attr.nullable),
    } }))));
//# sourceMappingURL=create.js.map
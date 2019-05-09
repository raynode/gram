"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const input_types_1 = require("input-types");
const utils_1 = require("utils");
exports.data = utils_1.memoizeContextModel(contextModel => utils_1.reduceContextFields(contextModel, {}, (data, attr, type, field) => (Object.assign({}, data, { [attr.name]: { type: graphql_1.isType(field) ? type : input_types_1.where(field) } }))));
//# sourceMappingURL=data.js.map
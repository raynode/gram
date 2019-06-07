"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const utils_1 = require("../utils");
exports.where = utils_1.memoizeContextModel(contextModel => utils_1.reduceContextFields(contextModel, contextModel.baseFilters(), (where, attr, type, field) => (Object.assign({}, where, contextModel.context.filterStrategy(graphql_1.isType(type) ? type : field, attr.name)))));
//# sourceMappingURL=where.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const utils_1 = require("../utils");
exports.filter = utils_1.memoizeContextModel(contextModel => utils_1.reduceContextFields(contextModel, contextModel.baseFilters(), (where, attr, type, field) => (Object.assign({}, where, (graphql_1.isType(field)
    ? contextModel.context.filterStrategy(type, attr.name)
    : null)))));
//# sourceMappingURL=filter.js.map
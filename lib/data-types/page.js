"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const utils_1 = require("../utils");
exports.page = utils_1.memoizeContextModel(() => ({
    limit: { type: graphql_1.GraphQLInt },
    offset: { type: graphql_1.GraphQLInt },
}));
//# sourceMappingURL=page.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const utils_1 = require("../utils");
exports.where = utils_1.memoizeContextModel(contextModel => new graphql_1.GraphQLInputObjectType({
    name: contextModel.names.types.whereType,
    fields: () => contextModel.dataFields('where'),
}));
//# sourceMappingURL=where.js.map
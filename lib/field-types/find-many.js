"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const input_types_1 = require("../input-types");
const utils_1 = require("../utils");
exports.findMany = utils_1.memoizeContextModel(contextModel => ({
    args: {
        [contextModel.names.arguments.order]: { type: input_types_1.order(contextModel) },
        [contextModel.names.arguments.page]: { type: input_types_1.page(contextModel) },
        [contextModel.names.arguments.where]: { type: graphql_1.GraphQLNonNull(input_types_1.where(contextModel)) },
    },
    type: contextModel.getListType(),
    resolve: (_, args, context) => contextModel.service.findMany({
        order: args[contextModel.names.arguments.order] || null,
        page: args[contextModel.names.arguments.page] || null,
        where: args[contextModel.names.arguments.where],
    }),
}));
//# sourceMappingURL=find-many.js.map
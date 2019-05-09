"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const input_types_1 = require("../input-types");
const utils_1 = require("../utils");
exports.remove = utils_1.memoizeContextModel(contextModel => ({
    args: {
        [contextModel.names.arguments.where]: { type: graphql_1.GraphQLNonNull(input_types_1.where(contextModel)) },
    },
    type: utils_1.toList(contextModel.getType()),
    resolve: (_, args, context) => contextModel.service.remove({
        where: args[contextModel.names.arguments.where],
    }),
}));
//# sourceMappingURL=remove.js.map
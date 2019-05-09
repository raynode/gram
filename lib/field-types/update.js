"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const input_types_1 = require("../input-types");
const utils_1 = require("../utils");
exports.update = utils_1.memoizeContextModel(contextModel => ({
    args: {
        [contextModel.names.arguments.data]: { type: graphql_1.GraphQLNonNull(input_types_1.data(contextModel)) },
        [contextModel.names.arguments.where]: { type: graphql_1.GraphQLNonNull(input_types_1.where(contextModel)) },
    },
    type: utils_1.toList(contextModel.getType()),
    resolve: (_, args, context) => contextModel.service.update({
        data: args[contextModel.names.arguments.data],
        where: args[contextModel.names.arguments.where],
    }),
}));
//# sourceMappingURL=update.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const input_types_1 = require("../input-types");
const utils_1 = require("../utils");
exports.create = utils_1.memoizeContextModel(contextModel => ({
    args: {
        [contextModel.names.arguments.data]: { type: graphql_1.GraphQLNonNull(input_types_1.create(contextModel)) },
    },
    type: contextModel.getType(),
    resolve: (_, args, context) => contextModel.service.create({
        data: args[contextModel.names.arguments.data],
    }),
}));
//# sourceMappingURL=create.js.map
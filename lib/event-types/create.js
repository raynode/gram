"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
exports.create = contextModel => ({
    subscribe: () => contextModel.getPubSub().asyncIterator(contextModel.names.events.create),
    resolve: ({ node }) => node,
    type: graphql_1.GraphQLNonNull(contextModel.getType()),
});
//# sourceMappingURL=create.js.map
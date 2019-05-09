"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("utils");
exports.remove = contextModel => ({
    subscribe: () => contextModel.getPubSub().asyncIterator(contextModel.names.events.delete),
    resolve: ({ node }) => node,
    type: utils_1.toList(contextModel.getType()),
});
//# sourceMappingURL=remove.js.map
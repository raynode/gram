"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.update = contextModel => ({
    subscribe: () => contextModel.getPubSub().asyncIterator(contextModel.names.events.update),
    resolve: ({ node }) => node,
    type: utils_1.toList(contextModel.getType()),
});
//# sourceMappingURL=update.js.map
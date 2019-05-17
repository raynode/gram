"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.create = utils_1.createContextModelFieldFn(contextModel => ({
    iterator: contextModel.names.events.delete,
    condition: 'nonnull',
}));
exports.remove = utils_1.createContextModelFieldFn(contextModel => ({
    iterator: contextModel.names.events.delete,
    condition: 'list',
}));
exports.update = utils_1.createContextModelFieldFn(contextModel => ({
    iterator: contextModel.names.events.update,
    condition: 'list',
}));
//# sourceMappingURL=index.js.map
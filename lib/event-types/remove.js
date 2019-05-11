"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.remove = utils_1.createContextModelFieldFn(contextModel => ({
    iterator: contextModel.names.events.delete,
    condition: 'list',
}));
//# sourceMappingURL=remove.js.map
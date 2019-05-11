"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.update = utils_1.createContextModelFieldFn(contextModel => ({
    iterator: contextModel.names.events.update,
    condition: 'list',
}));
//# sourceMappingURL=update.js.map
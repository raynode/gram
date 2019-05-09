"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.list = utils_1.memoizeContextModel(contextModel => ({
    page: { type: contextModel.context.getModel('Page').getType() },
    nodes: { type: utils_1.toList(contextModel.getType()) },
}));
//# sourceMappingURL=list.js.map
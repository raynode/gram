"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./equals"));
__export(require("./list"));
__export(require("./numeric"));
__export(require("./record"));
exports.joinFilters = (filters) => (name, type, list) => filters.reduce((result, filter) => (Object.assign({}, result, filter(name, type, list))), {});
exports.joinValidators = (filters) => 
// prettier-ignore
(...args) => filters.reduce((valid, check) => valid && check(...args), true);
//# sourceMappingURL=index.js.map
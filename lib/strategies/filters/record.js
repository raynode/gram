"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.record = (name, type, list) => ({
    [`${name}_in`]: { type: list },
    [`${name}_not_in`]: { type: list },
});
//# sourceMappingURL=record.js.map
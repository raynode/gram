"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const lodash_1 = require("lodash");
const utils_1 = require("../utils");
const specialCharsMap = new Map([['¼', 'frac14'], ['½', 'frac12'], ['¾', 'frac34']]);
const sanitizeEnumValue = lodash_1.memoize((value) => value
    .trim()
    .replace(/([^_a-zA-Z0-9])/g, (_, p) => specialCharsMap.get(p) || ' ')
    .split(' ')
    .map((v, i) => (i ? lodash_1.upperFirst(v) : v))
    .join('')
    .replace(/(^\d)/, '_$1'));
const buildOrderEnumValues = utils_1.memoizeContextModel(contextModel => lodash_1.mapKeys(lodash_1.flatten(contextModel.getFields()
    .map(attr => attr.name)
    .map(sanitizeEnumValue)
    .map(name => [`${name}_ASC`, `${name}_DESC`])).map(value => ({ value })), 'value'));
exports.order = utils_1.memoizeContextModel(contextModel => new graphql_1.GraphQLEnumType({
    name: contextModel.names.types.orderType,
    values: buildOrderEnumValues(contextModel),
}));
//# sourceMappingURL=order.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const lodash_1 = require("lodash");
const attributeBuilder_1 = require("./attributeBuilder");
exports.record = (service) => ({
    exists: (key) => service.hasOwnProperty(key) && typeof service[key] === 'function',
});
exports.toContextFn = (type) => {
    if (typeof type === 'function')
        return type;
    if (graphql_1.isType(type))
        return () => type;
    return context => context.getModel(type.name);
};
exports.toList = (type) => graphql_1.GraphQLNonNull(graphql_1.GraphQLList(graphql_1.GraphQLNonNull(type)));
exports.conditionalNonNull = (type, nonNull) => (nonNull ? graphql_1.GraphQLNonNull(type) : type);
exports.memoizeContextModel = (fn) => lodash_1.memoize(fn, (contextModel) => contextModel.id);
exports.reduceContextFields = (contextModel, base = null, reducer) => contextModel
    .getFields()
    .reduce((memo, attr) => reducer(memo, attr, attributeBuilder_1.buildType(attr, contextModel.context), attr.field(contextModel.context)), base || {});
exports.createPageType = (pageData, nodes) => ({
    page: pageData,
    nodes,
});
//# sourceMappingURL=utils.js.map
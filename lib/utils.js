"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const lodash_1 = require("lodash");
const attributeBuilder_1 = require("./attributeBuilder");
exports.isContextFn = (val) => typeof val === 'function';
exports.extractData = (data) => (context) => (exports.isContextFn(data) ? data(context) : data);
exports.record = (service) => ({
    exists: (key) => service.hasOwnProperty(key) && typeof service[key] === 'function',
});
exports.clearRecord = (record) => lodash_1.pickBy(record, lodash_1.identity);
exports.fieldsReducer = (reducer) => (context) => (fields, model) => (Object.assign({}, fields, exports.clearRecord(reducer(model.build(context)))));
// this Type construct will ensure that the returned object will have the same keys as
// the input object. It will also convert the properties from ModelBuilder to FieldReducer
exports.reduceFields = (models, reducers, fields) => lodash_1.reduce(reducers, (fields, reducer, name) => (Object.assign({}, fields, { [name]: lodash_1.reduce(models, reducer, fields[name]) })), fields);
exports.toContextFn = (type) => {
    if (typeof type === 'function')
        return type;
    if (graphql_1.isType(type))
        return () => type;
    return context => context.getModel(type.name);
};
exports.toList = (type) => graphql_1.GraphQLNonNull(graphql_1.GraphQLList(graphql_1.GraphQLNonNull(type)));
exports.conditionalList = (type, isList) => (isList ? exports.toList(type) : type);
exports.conditionalNonNull = (type, nonNull) => (nonNull ? graphql_1.GraphQLNonNull(type) : type);
exports.conditionalType = (type, condition) => condition === 'list'
    ? exports.toList(type)
    : condition === 'nonnull'
        ? graphql_1.GraphQLNonNull(type)
        : type;
exports.memoizeContextModel = (fn) => lodash_1.memoize(fn, (contextModel) => contextModel.id);
exports.reduceContextFields = (contextModel, base = null, reducer) => contextModel
    .getFields()
    .reduce((memo, attr) => reducer(memo, attr, attributeBuilder_1.buildType(attr, contextModel.context), attr.field(contextModel.context)), base || {});
exports.createPageType = (page, nodes) => ({
    page,
    nodes,
});
exports.createContextModelFieldFn = (configFn) => (contextModel) => {
    const { iterator, condition = 'none' } = configFn(contextModel);
    return {
        subscribe: () => contextModel.getPubSub().asyncIterator(iterator),
        resolve: ({ node }) => node,
        type: exports.conditionalType(contextModel.getType(), condition),
    };
};
exports.createInputType = (field, nameFn) => exports.memoizeContextModel(contextModel => new graphql_1.GraphQLInputObjectType({
    name: nameFn(contextModel),
    fields: () => contextModel.dataFields(field),
}));
//# sourceMappingURL=utils.js.map
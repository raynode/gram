import { GraphQLList, GraphQLNonNull, } from 'graphql';
import { memoize } from 'lodash';
import { buildType } from 'attributeBuilder';
export const toList = (type) => GraphQLNonNull(GraphQLList(GraphQLNonNull(type)));
export const conditionalNonNull = (type, nonNull) => nonNull ? GraphQLNonNull(type) : type;
export const memoizeContextModel = (fn) => memoize(fn, (contextModel) => contextModel.id);
export const reduceContextFields = (contextModel, base = null, reducer) => contextModel.getFields().reduce((memo, attr) => reducer(memo, attr, buildType(attr, contextModel.context), attr.field(contextModel.context)), base || {});
export const createPageType = (pageData, nodes) => ({
    page: pageData,
    nodes,
});
//# sourceMappingURL=utils.js.map
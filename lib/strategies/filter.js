"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const filters = require("./filters");
exports.filters = filters;
const hasParentType = (type) => type && type.hasOwnProperty('ofType');
const getParentType = (type) => (hasParentType(type) ? getParentType(type.ofType) : type);
exports.isSpecificScalarType = (name) => (type) => graphql_1.isScalarType(type) && type.name === name;
exports.isGraphQLString = exports.isSpecificScalarType('String');
exports.isGraphQLBoolean = exports.isSpecificScalarType('Boolean');
exports.isGraphQLFloat = exports.isSpecificScalarType('Float');
exports.isGraphQLInt = exports.isSpecificScalarType('Int');
exports.isGraphQLID = exports.isSpecificScalarType('ID');
exports.isIdOrString = (type) => graphql_1.isScalarType(type) && (exports.isGraphQLID(type) || exports.isGraphQLString(type));
exports.isNumeric = (type) => graphql_1.isScalarType(type) && (exports.isGraphQLFloat(type) || exports.isGraphQLInt(type));
const { equals, joinFilters, list, numeric, record } = filters;
exports.defaultMiddlewares = [
    [exports.isGraphQLBoolean, equals],
    [exports.isIdOrString, joinFilters([equals, record])],
    [exports.isNumeric, joinFilters([equals, numeric])],
    [graphql_1.isListType, list],
];
exports.createFilterStrategy = (middlewares) => (inputType, inputName) => {
    const type = getParentType(graphql_1.isType(inputType) ? inputType : inputType.getType());
    const name = inputName
        ? inputName
        : graphql_1.isType(inputType)
            ? `F${inputType.toString()}`
            : inputType.name;
    const list = graphql_1.GraphQLList(graphql_1.GraphQLNonNull(type));
    return middlewares.reduce((result, [check, filter]) => check(type) ? Object.assign({}, result, filter(name, type, list)) : result, {});
};
//# sourceMappingURL=filter.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const filters = require("./filters");
exports.filters = filters;
const hasParentType = (type) => type && type.hasOwnProperty('ofType');
const isNonNullType = (type) => !graphql_1.isNullableType(type);
const getParentType = (type) => (hasParentType(type) ? getParentType(type.ofType) : type);
const isList = (type) => isNonNullType(type)
    ? isList(type.ofType)
    : graphql_1.isListType(type);
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
    [(type, required, isList) => graphql_1.isScalarType(type) && isList, list],
];
exports.createFilterStrategy = (middlewares) => (inputType, inputName) => {
    const baseType = graphql_1.isType(inputType) ? inputType : inputType.getType();
    const type = getParentType(baseType);
    const name = inputName
        ? inputName
        : graphql_1.isType(inputType)
            ? `F${inputType.toString()}`
            : inputType.name;
    const list = graphql_1.GraphQLList(graphql_1.GraphQLNonNull(type));
    const isRequired = !graphql_1.isNullableType(baseType);
    const isListType = isList(baseType);
    return middlewares.reduce((result, [check, filter]) => check(type, isRequired, isListType, baseType) ? Object.assign({}, result, filter(name, type, list)) : result, {});
};
//# sourceMappingURL=filter.js.map
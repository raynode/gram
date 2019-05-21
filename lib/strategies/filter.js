"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const filters_1 = require("./filters");
const hasParentType = (type) => type && type.hasOwnProperty('ofType');
const getParentType = (type) => (hasParentType(type) ? getParentType(type.ofType) : type);
exports.isGraphQLString = (type) => type.name === 'String';
exports.isGraphQLBoolean = (type) => type.name === 'Boolean';
exports.isGraphQLFloat = (type) => type.name === 'Float';
exports.isGraphQLInt = (type) => type.name === 'Int';
exports.isGraphQLID = (type) => type.name === 'ID';
exports.isIdOrString = (type) => graphql_1.isScalarType(type) && (exports.isGraphQLID(type) || exports.isGraphQLString(type));
exports.isNumeric = (type) => graphql_1.isScalarType(type) && (exports.isGraphQLFloat(type) || exports.isGraphQLInt(type));
const middlewares = [
    [exports.isGraphQLBoolean, filters_1.equals],
    [exports.isIdOrString, filters_1.joinFilters([filters_1.equals, filters_1.record])],
    [exports.isNumeric, filters_1.joinFilters([filters_1.equals, filters_1.numeric])],
    [graphql_1.isListType, filters_1.list],
];
exports.filterStrategy = (inputType, inputName) => {
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
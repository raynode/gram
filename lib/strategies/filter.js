"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const hasParentType = (type) => type && type.hasOwnProperty('ofType');
const getParentType = (type) => hasParentType(type) ? getParentType(type.ofType) : type;
exports.isGraphQLString = (type) => type.name === 'String';
exports.isGraphQLBoolean = (type) => type.name === 'Boolean';
exports.isGraphQLFloat = (type) => type.name === 'Float';
exports.isGraphQLInt = (type) => type.name === 'Int';
exports.isGraphQLID = (type) => type.name === 'ID';
exports.filterStrategy = (inputType, inputName) => {
    const type = getParentType(graphql_1.isType(inputType) ? inputType : inputType.getType());
    const name = inputName ? inputName : (graphql_1.isType(inputType) ? `F${inputType.toString()}` : inputType.name);
    const list = graphql_1.GraphQLList(graphql_1.GraphQLNonNull(type));
    if (graphql_1.isScalarType(type)) {
        if (exports.isGraphQLID(type) || exports.isGraphQLString(type))
            return {
                [`${name}`]: { type },
                [`${name}_not`]: { type },
                [`${name}_in`]: { type: list },
                [`${name}_not_in`]: { type: list },
            };
        if (exports.isGraphQLBoolean(type))
            return { [`${name}`]: { type } };
        if (exports.isGraphQLFloat(type) || exports.isGraphQLInt(type))
            return {
                [`${name}`]: { type },
                [`${name}_not`]: { type },
                [`${name}_gt`]: { type },
                [`${name}_lt`]: { type },
            };
    }
    if (graphql_1.isListType(type))
        return {
            [`${name}_contains`]: { type },
            [`${name}_not_contains`]: { type },
        };
    return {};
};
//# sourceMappingURL=filter.js.map
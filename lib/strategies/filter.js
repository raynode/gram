import { GraphQLList, GraphQLNonNull, isListType, isScalarType, isType, } from 'graphql';
const hasParentType = (type) => type && type.hasOwnProperty('ofType');
const getParentType = (type) => hasParentType(type) ? getParentType(type.ofType) : type;
export const isGraphQLString = (type) => type.name === 'String';
export const isGraphQLBoolean = (type) => type.name === 'Boolean';
export const isGraphQLFloat = (type) => type.name === 'Float';
export const isGraphQLInt = (type) => type.name === 'Int';
export const isGraphQLID = (type) => type.name === 'ID';
export const filterStrategy = (inputType, inputName) => {
    const type = getParentType(isType(inputType) ? inputType : inputType.getType());
    const name = inputName ? inputName : (isType(inputType) ? `F${inputType.toString()}` : inputType.name);
    const list = GraphQLList(GraphQLNonNull(type));
    if (isScalarType(type)) {
        if (isGraphQLID(type) || isGraphQLString(type))
            return {
                [`${name}`]: { type },
                [`${name}_not`]: { type },
                [`${name}_in`]: { type: list },
                [`${name}_not_in`]: { type: list },
            };
        if (isGraphQLBoolean(type))
            return { [`${name}`]: { type } };
        if (isGraphQLFloat(type) || isGraphQLInt(type))
            return {
                [`${name}`]: { type },
                [`${name}_not`]: { type },
                [`${name}_gt`]: { type },
                [`${name}_lt`]: { type },
            };
    }
    if (isListType(type))
        return {
            [`${name}_contains`]: { type },
            [`${name}_not_contains`]: { type },
        };
    return {};
};
//# sourceMappingURL=filter.js.map
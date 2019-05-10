"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
exports.isIntValueNode = (node) => node.kind === 'IntValue';
exports.isStringValueNode = (node) => node.kind === 'StringValue';
/**
 * A special custom Scalar type for Dates that converts to a ISO formatted string
 * @param {String} options.name:
 * @param {String} options.description:
 * @param {Date} options.serialize(date)
 * @param {String} parseValue(value)
 * @param {Object} parseLiteral(ast)
 */
exports.DateType = new graphql_1.GraphQLScalarType({
    name: 'Date',
    description: 'A special custom Scalar type for Dates that converts to a ISO formatted string ',
    serialize(date) {
        if (!date)
            return null;
        if (date instanceof Date)
            return date.toISOString();
        return date;
    },
    parseValue(value) {
        if (!value)
            return null;
        try {
            return new Date(value);
        }
        catch (e) {
            return null;
        }
    },
    parseLiteral(ast) {
        if (exports.isIntValueNode(ast) || exports.isStringValueNode(ast))
            return new Date(ast.value);
        return null;
    },
});
//# sourceMappingURL=date-type.js.map
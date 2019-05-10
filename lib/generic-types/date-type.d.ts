import { GraphQLScalarType, IntValueNode, StringValueNode } from 'graphql';
export declare const isIntValueNode: (node: any) => node is IntValueNode;
export declare const isStringValueNode: (node: any) => node is StringValueNode;
/**
 * A special custom Scalar type for Dates that converts to a ISO formatted string
 * @param {String} options.name:
 * @param {String} options.description:
 * @param {Date} options.serialize(date)
 * @param {String} parseValue(value)
 * @param {Object} parseLiteral(ast)
 */
export declare const DateType: GraphQLScalarType;

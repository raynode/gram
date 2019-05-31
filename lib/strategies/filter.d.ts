import { GraphQLScalarType, GraphQLType } from 'graphql';
import { FilterMiddleware, FilterStrategy } from '../types';
import * as filters from './filters';
export { filters };
export interface GraphQLScalarTypeInstance<T extends string> extends GraphQLScalarType {
    name: T;
}
export declare const isSpecificScalarType: <Type extends string>(name: string) => (type: GraphQLType) => type is GraphQLScalarTypeInstance<Type>;
export declare const isGraphQLString: (type: GraphQLType) => type is GraphQLScalarTypeInstance<"String">;
export declare const isGraphQLBoolean: (type: GraphQLType) => type is GraphQLScalarTypeInstance<"Boolean">;
export declare const isGraphQLFloat: (type: GraphQLType) => type is GraphQLScalarTypeInstance<"Float">;
export declare const isGraphQLInt: (type: GraphQLType) => type is GraphQLScalarTypeInstance<"Int">;
export declare const isGraphQLID: (type: GraphQLType) => type is GraphQLScalarTypeInstance<"ID">;
export declare const isIdOrString: (type: GraphQLType) => boolean;
export declare const isNumeric: (type: GraphQLType) => boolean;
export declare const defaultMiddlewares: FilterMiddleware[];
export declare const createFilterStrategy: (middlewares: [import("../types").FilterCheckFn, import("../types").FilterFn][]) => FilterStrategy;

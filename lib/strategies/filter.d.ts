import { GraphQLList, GraphQLScalarType, GraphQLType } from 'graphql';
import { ContextModel } from 'types';
export interface GraphQLScalarTypeInstance<T extends string> extends GraphQLScalarType {
    name: T;
}
export declare const isGraphQLString: (type: GraphQLScalarType) => type is GraphQLScalarTypeInstance<"String">;
export declare const isGraphQLBoolean: (type: GraphQLScalarType) => type is GraphQLScalarTypeInstance<"Boolean">;
export declare const isGraphQLFloat: (type: GraphQLScalarType) => type is GraphQLScalarTypeInstance<"Float">;
export declare const isGraphQLInt: (type: GraphQLScalarType) => type is GraphQLScalarTypeInstance<"Int">;
export declare const isGraphQLID: (type: GraphQLScalarType) => type is GraphQLScalarTypeInstance<"ID">;
export declare const filterStrategy: <Type extends GraphQLType = GraphQLType>(inputType: Type | ContextModel<any, any>, inputName?: string) => {
    [x: string]: {
        type: GraphQLScalarTypeInstance<"String"> | GraphQLScalarTypeInstance<"ID">;
    } | {
        type: GraphQLList<GraphQLType>;
    };
} | {
    [x: string]: {
        type: GraphQLScalarTypeInstance<"Boolean">;
    };
} | {
    [x: string]: {
        type: GraphQLScalarTypeInstance<"Float"> | GraphQLScalarTypeInstance<"Int">;
    };
} | {
    [x: string]: {
        type: import("graphql").GraphQLWrappingType;
    };
};

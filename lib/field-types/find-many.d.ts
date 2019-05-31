/// <reference types="lodash" />
import { GraphQLNonNull, GraphQLOutputType } from 'graphql';
export declare const findMany: ((contextModel: import("..").ContextModel<unknown, any>) => {
    args: {
        [x: string]: {
            type: import("graphql").GraphQLEnumType;
        } | {
            type: import("graphql").GraphQLInputObjectType;
        } | {
            type: GraphQLNonNull<import("graphql").GraphQLNullableType>;
        };
    };
    type: GraphQLOutputType;
    resolve: (_: any, args: any, context: any) => Promise<import("..").Paged<Type>>;
}) & import("lodash").MemoizedFunction;

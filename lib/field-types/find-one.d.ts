/// <reference types="lodash" />
import { GraphQLNonNull, GraphQLOutputType } from 'graphql';
export declare const findOne: ((contextModel: import("..").ContextModel<{}, any>) => {
    args: {
        [x: string]: {
            type: GraphQLNonNull<import("graphql").GraphQLNullableType>;
        } | {
            type: import("graphql").GraphQLEnumType;
        };
    };
    type: GraphQLOutputType;
    resolve: (_: any, args: any, context: any) => Promise<Type>;
}) & import("lodash").MemoizedFunction;

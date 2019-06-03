/// <reference types="lodash" />
import { GraphQLInputType, GraphQLNonNull } from 'graphql';
export declare const update: ((contextModel: import("..").ContextModel<unknown, any, any>) => {
    args: {
        [x: string]: {
            type: GraphQLNonNull<import("graphql").GraphQLNullableType>;
        };
    };
    type: GraphQLInputType;
    resolve: (_: any, args: any, context: any) => Promise<Type[]>;
}) & import("lodash").MemoizedFunction;

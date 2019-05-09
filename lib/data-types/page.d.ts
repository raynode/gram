/// <reference types="lodash" />
export declare const page: ((contextModel: import("..").ContextModel<{}, any>) => {
    limit: {
        type: import("graphql").GraphQLScalarType;
    };
    offset: {
        type: import("graphql").GraphQLScalarType;
    };
}) & import("lodash").MemoizedFunction;

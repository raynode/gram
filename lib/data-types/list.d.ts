/// <reference types="lodash" />
export declare const list: ((contextModel: import("..").ContextModel<{}, any>) => {
    page: {
        type: import("graphql").GraphQLType;
    };
    nodes: {
        type: import("graphql").GraphQLType;
    };
}) & import("lodash").MemoizedFunction;

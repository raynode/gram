export declare const create: (contextModel: import("..").ContextModel<{}, any>) => {
    subscribe: () => any;
    resolve: ({ node }: {
        node: any;
    }) => any;
    type: import("graphql").GraphQLScalarType | import("graphql").GraphQLEnumType | import("graphql").GraphQLInputObjectType | import("graphql").GraphQLList<any> | import("graphql").GraphQLNonNull<import("graphql").GraphQLScalarType | import("graphql").GraphQLEnumType | import("graphql").GraphQLInputObjectType | import("graphql").GraphQLList<any>> | import("graphql").GraphQLNonNull<import("graphql").GraphQLNullableType>;
};

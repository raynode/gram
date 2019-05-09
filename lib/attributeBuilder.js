"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const constants_1 = require("types/constants");
const utils_1 = require("utils");
exports.buildType = (attr, context) => {
    const type = attr.field(context);
    const gqlType = graphql_1.isType(type) ? type : context.getModel(type.name).getType();
    if (attr.listType)
        return utils_1.toList(gqlType);
    if (!attr.nullable)
        return graphql_1.GraphQLNonNull(gqlType);
    return gqlType;
};
exports.createAttributeBuilder = (name, field) => {
    let resolve;
    const builder = {
        name,
        field,
        nullable: true,
        listType: false,
        resolve: (resolveFn) => {
            resolve = resolveFn;
            return builder;
        },
        isList: (isList = true) => {
            builder.listType = true;
            return builder;
        },
        isNotNullable: (isNotNullable = true) => {
            builder.nullable = !isNotNullable;
            return builder;
        },
        build: context => ({
            type: exports.buildType(builder, context),
            resolve,
        }),
        type: constants_1.ATTRIBUTEBUILDER,
    };
    return builder;
};
//# sourceMappingURL=attributeBuilder.js.map
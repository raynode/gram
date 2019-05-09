import { GraphQLNonNull, isType, } from 'graphql';
import { ATTRIBUTEBUILDER } from 'types/constants';
import { toList } from 'utils';
export const buildType = (attr, context) => {
    const type = attr.field(context);
    const gqlType = isType(type) ? type : context.getModel(type.name).getType();
    if (attr.listType)
        return toList(gqlType);
    if (!attr.nullable)
        return GraphQLNonNull(gqlType);
    return gqlType;
};
export const createAttributeBuilder = (name, field) => {
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
            type: buildType(builder, context),
            resolve,
        }),
        type: ATTRIBUTEBUILDER,
    };
    return builder;
};
//# sourceMappingURL=attributeBuilder.js.map
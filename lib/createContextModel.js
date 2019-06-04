"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_subscriptions_1 = require("graphql-subscriptions");
const lodash_1 = require("lodash");
const uuid_1 = require("uuid");
const naming_1 = require("./strategies/naming");
const DataTypes = require("./data-types");
const input_types_1 = require("./input-types");
const fieldBuilderFn = (context, resolvers) => (fields, attr) => {
    fields[attr.name] = attr.build(context);
    if (resolvers[attr.name])
        fields[attr.name].resolve = resolvers[attr.name];
    return fields;
};
const fieldBuilder = (context, resolvers) => (fields) => lodash_1.reduce(fields, fieldBuilderFn(context, resolvers), {});
exports.createContextModel = (model, service, context, visibility, resolvers) => {
    const buildFields = fieldBuilder(context, resolvers);
    const fields = [];
    const getFields = () => buildFields(fields);
    let contextModelIsInterface = false;
    const contextModel = {
        addField: (field) => {
            fields.push(field);
            return field;
        },
        baseFilters: lodash_1.memoize(() => ({
            AND: { type: graphql_1.GraphQLList(graphql_1.GraphQLNonNull(input_types_1.filter(contextModel))) },
            OR: { type: graphql_1.GraphQLList(graphql_1.GraphQLNonNull(input_types_1.filter(contextModel))) },
            NOT: { type: input_types_1.filter(contextModel) },
        })),
        context,
        dataFields: lodash_1.memoize(type => {
            switch (type) {
                case 'create':
                    return DataTypes.create(contextModel);
                case 'data':
                    return DataTypes.data(contextModel);
                case 'filter':
                    return DataTypes.filter(contextModel);
                case 'list':
                    return DataTypes.list(contextModel);
                case 'page':
                    return DataTypes.page(contextModel);
                case 'where':
                    return DataTypes.where(contextModel);
            }
        }),
        getFields: () => fields,
        getListType: lodash_1.memoize(() => new graphql_1.GraphQLObjectType({
            name: contextModel.names.types.listType,
            fields: () => contextModel.dataFields('list'),
            interfaces: () => [context.getModel('List').getType()],
        })),
        getPubSub: lodash_1.memoize(() => new graphql_subscriptions_1.PubSub()),
        getType: lodash_1.memoize(() => contextModelIsInterface
            ? new graphql_1.GraphQLInterfaceType({
                name: model.name,
                fields: getFields,
            })
            : new graphql_1.GraphQLObjectType({
                name: model.name,
                fields: getFields,
                interfaces: () => {
                    const interfaces = model.getInterfaces();
                    return model
                        .getInterfaces()
                        .map(context.getModel)
                        .map(model => model.getType());
                },
            })),
        id: uuid_1.v4(),
        isInterface: () => contextModelIsInterface,
        name: model.name,
        names: naming_1.defaultNamingStrategy(model.name),
        service,
        setInterface: () => {
            contextModelIsInterface = true;
        },
        visibility: Object.assign({}, visibility),
    };
    return contextModel;
};
//# sourceMappingURL=createContextModel.js.map
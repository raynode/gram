"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const lodash_1 = require("lodash");
const modelBuilder_1 = require("./modelBuilder");
const uuid_1 = require("uuid");
const field_reducers_1 = require("./field-reducers");
const constants_1 = require("./types/constants");
const generic_types_1 = require("./generic-types");
const wrapContext = (context, generics) => {
    const models = {};
    return {
        id: uuid_1.v4(),
        context,
        addModel: (name, model) => (models[name] = model),
        getModel: name => models[name],
        getGenericType: name => generics[name],
    };
};
exports.createSchemaBuilder = () => {
    const addNodeAttrs = (model) => {
        model.attr('id', graphql_1.GraphQLID);
        model.attr('createdAt', context => context.getGenericType('Date'));
        model.attr('updatedAt', context => context.getGenericType('Date'));
        model.attr('deletedAt', context => context.getGenericType('Date'));
        return model;
    };
    const node = modelBuilder_1.createModelBuilder('Node', {}).setInterface();
    const page = modelBuilder_1.createModelBuilder('Page', {});
    const list = modelBuilder_1.createModelBuilder('List', {}).setInterface();
    addNodeAttrs(node);
    page.attr('page', graphql_1.GraphQLInt);
    page.attr('limit', graphql_1.GraphQLInt);
    page.attr('offset', graphql_1.GraphQLInt);
    list.attr('page', page);
    list.attr('nodes', node).isList();
    const models = {
        Node: node,
        Page: page,
        List: list,
    };
    const generics = {
        Date: generic_types_1.DateType,
        JSON: generic_types_1.JSONType,
        Upload: generic_types_1.UploadType,
    };
    const builder = {
        type: constants_1.SCHEMABUILDER,
        models,
        model: (modelName, service) => {
            const model = modelBuilder_1.createModelBuilder(modelName, service || {});
            models[modelName] = model;
            return addNodeAttrs(model.interface('Node'));
        },
        interface: (interfaceName, service) => builder.model(interfaceName, service).setInterface(),
        build: (context = null) => {
            const wrapped = wrapContext(context, generics);
            lodash_1.forEach(models, model => model.setup(wrapped));
            models.Node.build(wrapped);
            models.Page.build(wrapped);
            models.List.build(wrapped);
            const mutationFields = lodash_1.reduce(models, field_reducers_1.mutationFieldsReducer(wrapped), {});
            const queryFields = lodash_1.reduce(models, field_reducers_1.queryFieldsReducer(wrapped), {});
            const subscriptionFields = lodash_1.reduce(models, field_reducers_1.subscriptionFieldsReducer(wrapped), {});
            return new graphql_1.GraphQLSchema({
                query: new graphql_1.GraphQLObjectType({
                    name: 'Query',
                    fields: queryFields,
                }),
                mutation: new graphql_1.GraphQLObjectType({
                    name: 'Mutation',
                    fields: mutationFields,
                }),
                subscription: new graphql_1.GraphQLObjectType({
                    name: 'Subscription',
                    fields: subscriptionFields,
                }),
            });
        },
        setGenericType: (key, type) => {
            generics[key] = type;
            return builder;
        },
        getGenericType: key => generics[key],
    };
    return builder;
};
//# sourceMappingURL=schemaBuilder.js.map
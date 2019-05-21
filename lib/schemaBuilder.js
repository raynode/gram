"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const lodash_1 = require("lodash");
const modelBuilder_1 = require("./modelBuilder");
const guards_1 = require("./types/guards");
const uuid_1 = require("uuid");
const field_reducers_1 = require("./field-reducers");
const constants_1 = require("./types/constants");
const utils_1 = require("utils");
const generic_types_1 = require("./generic-types");
const wrapContext = (context, generics, models) => {
    const contextModels = {};
    return {
        id: uuid_1.v4(),
        context,
        addModel: (name, model) => (contextModels[name] = model),
        getBaseModel: name => models[name],
        getModel: name => contextModels[name],
        getGenericType: name => generics[name],
    };
};
const addNodeAttrs = (model) => {
    model.attr('id', graphql_1.GraphQLID);
    model.attr('createdAt', context => context.getGenericType('Date'));
    model.attr('updatedAt', context => context.getGenericType('Date'));
    model.attr('deletedAt', context => context.getGenericType('Date'));
    return model;
};
const createBaseModels = () => {
    const node = modelBuilder_1.createModelBuilder('Node', {}).setInterface();
    const page = modelBuilder_1.createModelBuilder('Page', {});
    const list = modelBuilder_1.createModelBuilder('List', {}).setInterface();
    addNodeAttrs(node);
    page.attr('page', graphql_1.GraphQLInt);
    page.attr('limit', graphql_1.GraphQLInt);
    page.attr('offset', graphql_1.GraphQLInt);
    list.attr('page', page);
    list.attr('nodes', node).isList();
    return {
        Node: node,
        Page: page,
        List: list,
    };
};
const setup = (models, generics, context) => {
    const wrapped = wrapContext(context, generics, models);
    lodash_1.forEach(models, model => model.setup(wrapped));
    // models.Node.build(wrapped)
    // models.Page.build(wrapped)
    // models.List.build(wrapped)
    return wrapped;
};
exports.createSchema = (definition) => {
    const schema = {
        query: new graphql_1.GraphQLObjectType({
            name: 'Query',
            fields: definition.query,
        }),
    };
    if (Object.keys(definition.mutation).length)
        schema.mutation = new graphql_1.GraphQLObjectType({
            name: 'Mutation',
            fields: definition.mutation,
        });
    if (Object.keys(definition.subscription).length)
        schema.subscription = new graphql_1.GraphQLObjectType({
            name: 'Subscription',
            fields: definition.subscription,
        });
    return new graphql_1.GraphQLSchema(schema);
};
exports.createSchemaBuilder = () => {
    const models = createBaseModels();
    const generics = { Date: generic_types_1.DateType, JSON: generic_types_1.JSONType };
    const builder = {
        type: constants_1.SCHEMABUILDER,
        models,
        model: (modelName, service) => {
            const model = modelBuilder_1.createModelBuilder(modelName, service || {});
            models[modelName] = model;
            return model.interface('Node');
        },
        interface: (interfaceName, service) => {
            const model = modelBuilder_1.createModelBuilder(interfaceName, service || {});
            models[interfaceName] = model;
            model.setInterface();
            return model;
        },
        build: (context = null) => exports.createSchema(guards_1.isFieldDefinition(context) ? context : builder.fields(context)),
        fields: (context = null) => {
            const wrapped = setup(models, generics, context);
            // build all interfaces
            lodash_1.filter(models, model => model.isInterface()).forEach(model => model.build(wrapped));
            // create the query, mutation and subscription fields
            return utils_1.reduceFields(models, {
                query: field_reducers_1.queryFieldsReducer(wrapped),
                mutation: field_reducers_1.mutationFieldsReducer(wrapped),
                subscription: field_reducers_1.subscriptionFieldsReducer(wrapped),
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
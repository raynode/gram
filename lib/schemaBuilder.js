"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_scalars_1 = require("@saeris/graphql-scalars");
const graphql_1 = require("graphql");
const lodash_1 = require("lodash");
const uuid_1 = require("uuid");
const field_reducers_1 = require("./field-reducers");
const modelBuilder_1 = require("./modelBuilder");
const filter_1 = require("./strategies/filter");
const constants_1 = require("./types/constants");
const guards_1 = require("./types/guards");
const utils_1 = require("./utils");
const wrapContext = (context, scalars, models, filters) => {
    const contextModels = {};
    return {
        id: uuid_1.v4(),
        context,
        filterStrategy: filter_1.createFilterStrategy(filters),
        addModel: (name, model) => (contextModels[name] = model),
        getBaseModel: name => models[name],
        getModel: name => contextModels[name],
        getScalar: name => scalars[name]
    };
};
const addNodeAttrs = (model) => {
    model.attr("id", graphql_1.GraphQLID);
    model.attr("createdAt", context => context.getScalar("DateTime"));
    model.attr("updatedAt", context => context.getScalar("DateTime"));
    model.attr("deletedAt", context => context.getScalar("DateTime"));
    return model;
};
const createBaseModels = () => {
    const node = modelBuilder_1.createModelBuilder("Node", {}).setInterface();
    const page = modelBuilder_1.createModelBuilder("Page", {});
    const list = modelBuilder_1.createModelBuilder("List", {}).setInterface();
    addNodeAttrs(node);
    page.attr("page", graphql_1.GraphQLInt);
    page.attr("limit", graphql_1.GraphQLInt);
    page.attr("offset", graphql_1.GraphQLInt);
    list.attr("page", page);
    list.attr("nodes", node).isList();
    return {
        Node: node,
        Page: page,
        List: list
    };
};
const setup = (models, scalars, context, filters) => {
    const wrapped = wrapContext(context, scalars, models, filters);
    lodash_1.forEach(models, model => model.setup(wrapped));
    return wrapped;
};
exports.createSchema = (definition) => {
    const schema = {
        query: new graphql_1.GraphQLObjectType({
            name: "Query",
            fields: definition.query
        })
    };
    if (Object.keys(definition.mutation).length)
        schema.mutation = new graphql_1.GraphQLObjectType({
            name: "Mutation",
            fields: definition.mutation
        });
    if (Object.keys(definition.subscription).length)
        schema.subscription = new graphql_1.GraphQLObjectType({
            name: "Subscription",
            fields: definition.subscription
        });
    return new graphql_1.GraphQLSchema(schema);
};
exports.createSchemaBuilder = () => {
    const models = createBaseModels();
    const scalars = { DateTime: graphql_scalars_1.DateTime };
    const filters = filter_1.defaultMiddlewares;
    const queryDefinitions = [];
    const builder = {
        type: constants_1.SCHEMABUILDER,
        models,
        model: (modelName, service) => {
            const model = modelBuilder_1.createModelBuilder(modelName, service || {});
            models[modelName] = model;
            return model.interface("Node");
        },
        interface: (interfaceName, service) => {
            const model = modelBuilder_1.createModelBuilder(interfaceName, service || {});
            models[interfaceName] = model;
            model.setInterface();
            return model;
        },
        build: (context = null) => exports.createSchema(guards_1.isFieldDefinition(context) ? context : builder.fields(context)),
        fields: (context = null) => {
            const wrapped = setup(models, scalars, context, filters);
            // build all interfaces
            lodash_1.filter(models, model => model.isInterface()).forEach(model => model.build(wrapped));
            const query = queryDefinitions.reduce((memo, queryDefinition) => {
                const { args, name, resolver: resolve, type: contextType } = utils_1.extractData(queryDefinition)(wrapped);
                const type = graphql_1.isType(contextType)
                    ? contextType
                    : wrapped.getModel(contextType.name).getType();
                memo[name] = { name, type, args, resolve };
                return memo;
            }, {});
            // create the query, mutation and subscription fields
            return utils_1.reduceFields(models, {
                query: field_reducers_1.queryFieldsReducer(wrapped),
                mutation: field_reducers_1.mutationFieldsReducer(wrapped),
                subscription: field_reducers_1.subscriptionFieldsReducer(wrapped)
            }, {
                mutation: {},
                query,
                subscription: {}
            });
        },
        setScalar: (key, type) => {
            scalars[key] = type;
            return type;
        },
        getScalar: key => scalars[key],
        addFilter: (check, filter) => {
            filters.push([check, filter]);
            return builder;
        },
        addQuery: definition => {
            queryDefinitions.push(definition);
            return builder;
        }
    };
    return builder;
};
//# sourceMappingURL=schemaBuilder.js.map
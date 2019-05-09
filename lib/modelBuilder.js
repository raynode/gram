"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const lodash_1 = require("lodash");
const attributeBuilder_1 = require("./attributeBuilder");
const createContextModel_1 = require("./createContextModel");
const constants_1 = require("./types/constants");
const serviceToVisibility = (service) => ({
    createMutation: service.hasOwnProperty('create') && typeof service.create === 'function',
    createSubscription: service.hasOwnProperty('create') && typeof service.create === 'function',
    deleteMutation: service.hasOwnProperty('remove') && typeof service.remove === 'function',
    deleteSubscription: service.hasOwnProperty('remove') && typeof service.remove === 'function',
    findManyQuery: service.hasOwnProperty('findMany') && typeof service.findMany === 'function',
    findOneQuery: service.hasOwnProperty('findOne') && typeof service.findOne === 'function',
    updateMutation: service.hasOwnProperty('update') && typeof service.update === 'function',
    updateSubscription: service.hasOwnProperty('update') && typeof service.update === 'function',
});
exports.createModelBuilder = (modelName, service, contextFn) => {
    const attributes = {};
    let contextMutation = () => null;
    let listType = null;
    let isInterface = false;
    const interfaces = [];
    const visibility = service ? serviceToVisibility(service) : {
        createMutation: false,
        deleteMutation: false,
        findManyQuery: false,
        findOneQuery: false,
        updateMutation: false,
        createSubscription: false,
        updateSubscription: false,
        deleteSubscription: false,
    };
    const builder = {
        type: constants_1.MODELBUILDER,
        name: modelName,
        getInterfaces: () => interfaces,
        getListType: () => listType,
        setInterface: () => {
            isInterface = true;
            return builder;
        },
        isInterface: () => isInterface,
        attr: (attributeName, type) => {
            if (!type)
                throw new Error(`${modelName}.attr(${attributeName}) needs to provide either a GraphQLType or a ModelBuilder`);
            return attributes[attributeName] = graphql_1.isType(type)
                // add attribute
                ? attributeBuilder_1.createAttributeBuilder(attributeName, () => type)
                // add association
                : attributeBuilder_1.createAttributeBuilder(attributeName, context => context.getModel(type.name));
        },
        setup: context => {
            const contextModel = createContextModel_1.createContextModel(builder, service, context, visibility);
            if (contextFn)
                contextFn(contextModel, context);
            if (isInterface)
                contextModel.setInterface();
            context.addModel(modelName, contextModel);
        },
        build: lodash_1.memoize(context => {
            const contextModel = context.getModel(modelName);
            lodash_1.forEach(attributes, attr => contextModel.addField(attr));
            contextMutation(contextModel, context);
            return contextModel;
        }, context => context.id),
        context: mutator => {
            contextMutation = mutator;
            return builder;
        },
        interface: modelName => {
            interfaces.push(modelName);
            return builder;
        },
        listType: model => {
            listType = model;
            return builder;
        },
    };
    return builder;
};
//# sourceMappingURL=modelBuilder.js.map
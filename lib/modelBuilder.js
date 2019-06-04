"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const attributeBuilder_1 = require("./attributeBuilder");
const createContextModel_1 = require("./createContextModel");
const constants_1 = require("./types/constants");
const utils_1 = require("./utils");
const serviceToVisibility = (service) => {
    const { exists } = utils_1.record(service);
    return {
        createMutation: exists('create'),
        createSubscription: exists('create'),
        deleteMutation: exists('remove'),
        deleteSubscription: exists('remove'),
        findManyQuery: exists('findMany'),
        findOneQuery: exists('findOne'),
        updateMutation: exists('update'),
        updateSubscription: exists('update'),
    };
};
exports.createModelBuilder = (modelName, service, contextFn) => {
    const attributes = {};
    let contextMutation = () => null;
    let listType = null;
    let isInterface = false;
    let resolver = null;
    const interfaces = [];
    const visibility = service
        ? serviceToVisibility(service)
        : {
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
            return (attributes[attributeName] = attributeBuilder_1.createAttributeBuilder(attributeName, utils_1.toContextFn(type)));
        },
        setup: context => {
            const contextModel = createContextModel_1.createContextModel(builder, service, context, visibility, resolver ? resolver(context) : {});
            if (contextFn)
                contextFn(contextModel, context);
            if (isInterface)
                contextModel.setInterface();
            context.addModel(modelName, contextModel);
        },
        build: lodash_1.memoize(context => {
            const contextModel = context.getModel(modelName);
            lodash_1.forEach(attributes, attr => contextModel.addField(attr));
            interfaces
                .map(name => context.getBaseModel(name))
                .forEach(model => {
                lodash_1.forEach(model.getAttributes(), (attr, name) => {
                    if (!attributes.hasOwnProperty(name))
                        contextModel.addField(attr);
                });
            });
            contextMutation(contextModel, context);
            return contextModel;
        }, context => context.id),
        resolve: modelResolver => {
            resolver = modelResolver;
            return builder;
        },
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
        getAttributes: () => attributes,
    };
    return builder;
};
//# sourceMappingURL=modelBuilder.js.map
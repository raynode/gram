import { isType } from 'graphql';
import { forEach, memoize } from 'lodash';
import { createAttributeBuilder } from 'attributeBuilder';
import { createContextModel } from 'createContextModel';
import { MODELBUILDER } from 'types/constants';
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
export const createModelBuilder = (modelName, service, contextFn) => {
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
        type: MODELBUILDER,
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
            return attributes[attributeName] = isType(type)
                // add attribute
                ? createAttributeBuilder(attributeName, () => type)
                // add association
                : createAttributeBuilder(attributeName, context => context.getModel(type.name));
        },
        setup: context => {
            const contextModel = createContextModel(builder, service, context, visibility);
            if (contextFn)
                contextFn(contextModel, context);
            if (isInterface)
                contextModel.setInterface();
            context.addModel(modelName, contextModel);
        },
        build: memoize(context => {
            const contextModel = context.getModel(modelName);
            forEach(attributes, attr => contextModel.addField(attr));
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
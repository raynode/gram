import { GraphQLID, GraphQLInt, GraphQLObjectType, GraphQLSchema, GraphQLString, } from 'graphql';
import { forEach, reduce } from 'lodash';
import { createModelBuilder } from 'modelBuilder';
import { mutationFieldsReducer, queryFieldsReducer, subscriptionFieldsReducer } from 'field-reducers';
import { SCHEMABUILDER } from 'types/constants';
import { v4 as uuid } from 'uuid';
const wrapContext = (context) => {
    const models = {};
    return {
        id: uuid(),
        context,
        addModel: (name, model) => models[name] = model,
        getModel: name => models[name],
    };
};
export const createSchemaBuilder = () => {
    const addNodeAttrs = (model) => {
        model.attr('id', GraphQLID);
        model.attr('createdAt', GraphQLString);
        model.attr('updatedAt', GraphQLString);
        model.attr('deletedAt', GraphQLString);
        return model;
    };
    const node = createModelBuilder('Node', {}).setInterface();
    const page = createModelBuilder('Page', {});
    const list = createModelBuilder('List', {}).setInterface();
    addNodeAttrs(node);
    page.attr('page', GraphQLInt);
    page.attr('limit', GraphQLInt);
    page.attr('offset', GraphQLInt);
    list.attr('page', page);
    list.attr('nodes', node).isList();
    const models = {
        Node: node,
        Page: page,
        List: list,
    };
    const builder = {
        type: SCHEMABUILDER,
        models,
        model: (modelName, service) => {
            const model = createModelBuilder(modelName, service || {});
            models[modelName] = model;
            return addNodeAttrs(model.interface('Node'));
        },
        interface: (interfaceName, service) => builder.model(interfaceName, service).setInterface(),
        build: (context = null) => {
            const wrapped = wrapContext(context);
            forEach(models, model => model.setup(wrapped));
            models.Node.build(wrapped);
            models.Page.build(wrapped);
            models.List.build(wrapped);
            const mutationFields = reduce(models, mutationFieldsReducer(wrapped), {});
            const queryFields = reduce(models, queryFieldsReducer(wrapped), {});
            const subscriptionFields = reduce(models, subscriptionFieldsReducer(wrapped), {});
            return new GraphQLSchema({
                query: new GraphQLObjectType({
                    name: 'Query',
                    fields: queryFields,
                }),
                mutation: new GraphQLObjectType({
                    name: 'Mutation',
                    fields: mutationFields,
                }),
                subscription: new GraphQLObjectType({
                    name: 'Subscription',
                    fields: subscriptionFields,
                }),
            });
        },
    };
    return builder;
};
//# sourceMappingURL=schemaBuilder.js.map
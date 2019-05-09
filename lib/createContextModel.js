import { GraphQLInterfaceType, GraphQLList, GraphQLNonNull, GraphQLObjectType, } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { memoize, reduce } from 'lodash';
import { v4 as uuid } from 'uuid';
import { defaultNamingStrategy } from 'strategies/naming';
import * as DataTypes from 'data-types';
import { filter } from 'input-types';
export const createContextModel = (model, service, context, visibility) => {
    const buildFields = (fields) => reduce(fields, (fields, attr) => {
        fields[attr.name] = attr.build(context);
        return fields;
    }, {});
    const fields = [];
    const getFields = () => buildFields(fields);
    let contextModelIsInterface = false;
    const contextModel = {
        addField: (field) => {
            fields.push(field);
            return field;
        },
        baseFilters: memoize(() => ({
            AND: { type: GraphQLList(GraphQLNonNull(filter(contextModel))) },
            OR: { type: GraphQLList(GraphQLNonNull(filter(contextModel))) },
            NOT: { type: filter(contextModel) },
        })),
        context,
        dataFields: memoize(type => {
            switch (type) {
                case 'create': return DataTypes.create(contextModel);
                case 'data': return DataTypes.data(contextModel);
                case 'filter': return DataTypes.filter(contextModel);
                case 'list': return DataTypes.list(contextModel);
                case 'page': return DataTypes.page(contextModel);
                case 'where': return DataTypes.where(contextModel);
            }
        }),
        getFields: () => fields,
        getListType: memoize(() => new GraphQLObjectType({
            name: contextModel.names.types.listType,
            fields: () => contextModel.dataFields('list'),
            interfaces: () => [context.getModel('List').getType()],
        })),
        getPubSub: memoize(() => new PubSub()),
        getType: memoize(() => contextModelIsInterface
            ? new GraphQLInterfaceType({
                name: model.name,
                fields: getFields,
            })
            : new GraphQLObjectType({
                name: model.name,
                fields: getFields,
                interfaces: () => {
                    const interfaces = model.getInterfaces();
                    return model.getInterfaces().map(context.getModel).map(model => model.getType());
                },
            })),
        id: uuid(),
        isInterface: () => contextModelIsInterface,
        name: model.name,
        names: defaultNamingStrategy(model.name),
        service,
        setInterface: () => { contextModelIsInterface = true; },
        visibility: Object.assign({}, visibility),
    };
    return contextModel;
};
//# sourceMappingURL=createContextModel.js.map
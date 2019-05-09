import { GraphQLInputObjectType } from 'graphql';
import { memoizeContextModel } from 'utils';
export const create = memoizeContextModel(contextModel => new GraphQLInputObjectType({
    name: contextModel.names.types.createType,
    fields: () => contextModel.dataFields('create'),
}));
//# sourceMappingURL=create.js.map
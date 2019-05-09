import { GraphQLInputObjectType } from 'graphql';
import { memoizeContextModel } from 'utils';
export const where = memoizeContextModel(contextModel => new GraphQLInputObjectType({
    name: contextModel.names.types.whereType,
    fields: () => contextModel.dataFields('where'),
}));
//# sourceMappingURL=where.js.map
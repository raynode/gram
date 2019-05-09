import { GraphQLInputObjectType } from 'graphql';
import { memoizeContextModel } from 'utils';
export const data = memoizeContextModel(contextModel => new GraphQLInputObjectType({
    name: contextModel.names.types.dataType,
    fields: () => contextModel.dataFields('data'),
}));
//# sourceMappingURL=data.js.map
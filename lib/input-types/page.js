import { GraphQLInputObjectType } from 'graphql';
import { memoizeContextModel } from 'utils';
export const page = memoizeContextModel(contextModel => new GraphQLInputObjectType({
    name: contextModel.names.types.pageType,
    fields: () => contextModel.dataFields('page'),
}));
//# sourceMappingURL=page.js.map
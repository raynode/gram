import { GraphQLNonNull } from 'graphql';
import { order, page, where } from 'input-types';
import { memoizeContextModel } from 'utils';
export const findMany = memoizeContextModel(contextModel => ({
    args: {
        [contextModel.names.arguments.order]: { type: order(contextModel) },
        [contextModel.names.arguments.page]: { type: page(contextModel) },
        [contextModel.names.arguments.where]: { type: GraphQLNonNull(where(contextModel)) },
    },
    type: contextModel.getListType(),
    resolve: (_, args, context) => contextModel.service.findMany({
        order: args[contextModel.names.arguments.order] || null,
        page: args[contextModel.names.arguments.page] || null,
        where: args[contextModel.names.arguments.where],
    }),
}));
//# sourceMappingURL=find-many.js.map
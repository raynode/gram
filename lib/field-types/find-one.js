import { GraphQLNonNull } from 'graphql';
import { order, where } from 'input-types';
import { memoizeContextModel } from 'utils';
export const findOne = memoizeContextModel(contextModel => ({
    args: {
        [contextModel.names.arguments.where]: { type: GraphQLNonNull(where(contextModel)) },
        [contextModel.names.arguments.order]: { type: order(contextModel) },
    },
    type: contextModel.getType(),
    resolve: (_, args, context) => contextModel.service.findOne({
        where: args[contextModel.names.arguments.where],
        order: args[contextModel.names.arguments.order] || null,
    }),
}));
//# sourceMappingURL=find-one.js.map
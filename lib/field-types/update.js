import { GraphQLNonNull } from 'graphql';
import { data, where } from 'input-types';
import { memoizeContextModel, toList } from 'utils';
export const update = memoizeContextModel(contextModel => ({
    args: {
        [contextModel.names.arguments.data]: { type: GraphQLNonNull(data(contextModel)) },
        [contextModel.names.arguments.where]: { type: GraphQLNonNull(where(contextModel)) },
    },
    type: toList(contextModel.getType()),
    resolve: (_, args, context) => contextModel.service.update({
        data: args[contextModel.names.arguments.data],
        where: args[contextModel.names.arguments.where],
    }),
}));
//# sourceMappingURL=update.js.map
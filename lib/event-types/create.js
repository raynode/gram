import { GraphQLNonNull } from 'graphql';
export const create = contextModel => ({
    subscribe: () => contextModel.getPubSub().asyncIterator(contextModel.names.events.create),
    resolve: ({ node }) => node,
    type: GraphQLNonNull(contextModel.getType()),
});
//# sourceMappingURL=create.js.map
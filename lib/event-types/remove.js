import { toList } from 'utils';
export const remove = contextModel => ({
    subscribe: () => contextModel.getPubSub().asyncIterator(contextModel.names.events.delete),
    resolve: ({ node }) => node,
    type: toList(contextModel.getType()),
});
//# sourceMappingURL=remove.js.map
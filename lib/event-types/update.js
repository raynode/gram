import { toList } from 'utils';
export const update = contextModel => ({
    subscribe: () => contextModel.getPubSub().asyncIterator(contextModel.names.events.update),
    resolve: ({ node }) => node,
    type: toList(contextModel.getType()),
});
//# sourceMappingURL=update.js.map
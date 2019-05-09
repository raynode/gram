import { GraphQLInt } from 'graphql';
import { memoizeContextModel } from 'utils';
export const page = memoizeContextModel(() => ({
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
}));
//# sourceMappingURL=page.js.map
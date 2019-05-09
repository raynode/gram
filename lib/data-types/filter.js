import { isType } from 'graphql';
import { filterStrategy } from 'strategies/filter';
import { memoizeContextModel, reduceContextFields } from 'utils';
export const filter = memoizeContextModel(contextModel => reduceContextFields(contextModel, contextModel.baseFilters(), (where, attr, type, field) => ({
    ...where,
    ...(isType(field) ? filterStrategy(type, attr.name) : null),
})));
//# sourceMappingURL=filter.js.map
import { isType } from 'graphql';
import { filterStrategy } from 'strategies/filter';
import { memoizeContextModel, reduceContextFields } from 'utils';
export const where = memoizeContextModel(contextModel => reduceContextFields(contextModel, contextModel.baseFilters(), (where, attr, type, field) => (Object.assign({}, where, filterStrategy(isType(type) ? type : field, attr.name)))));
//# sourceMappingURL=where.js.map
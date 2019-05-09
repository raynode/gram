import { isType } from 'graphql';
import { where } from 'input-types';
import { memoizeContextModel, reduceContextFields } from 'utils';
export const data = memoizeContextModel(contextModel => reduceContextFields(contextModel, {}, (data, attr, type, field) => ({
    ...data,
    [attr.name]: { type: isType(field) ? type : where(field) },
})));
//# sourceMappingURL=data.js.map
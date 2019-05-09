import { isType } from 'graphql';
import { where } from 'input-types';
import { conditionalNonNull, memoizeContextModel, reduceContextFields } from 'utils';
export const create = memoizeContextModel(contextModel => reduceContextFields(contextModel, {}, (create, attr, type, field) => (Object.assign({}, create, { [attr.name]: { type: isType(field) ? type : conditionalNonNull(where(field), !attr.nullable) } }))));
//# sourceMappingURL=create.js.map
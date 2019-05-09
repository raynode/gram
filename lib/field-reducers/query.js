import { findMany, findOne, } from 'field-types';
export const queryFieldsReducer = (context) => (fields, model) => {
    if (model.isInterface())
        return fields;
    const contextModel = model.build(context);
    if (contextModel.visibility.findOneQuery)
        fields[contextModel.names.fields.findOne] = findOne(contextModel);
    if (contextModel.visibility.findManyQuery)
        fields[contextModel.names.fields.findMany] = findMany(contextModel);
    return fields;
};
//# sourceMappingURL=query.js.map
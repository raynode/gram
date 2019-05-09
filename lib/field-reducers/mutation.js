import { create, remove, update, } from 'field-types';
export const mutationFieldsReducer = (context) => (fields, model) => {
    if (model.isInterface())
        return fields;
    const contextModel = model.build(context);
    if (contextModel.visibility.createMutation)
        fields[contextModel.names.fields.create] = create(contextModel);
    if (contextModel.visibility.updateMutation)
        fields[contextModel.names.fields.update] = update(contextModel);
    if (contextModel.visibility.deleteMutation)
        fields[contextModel.names.fields.delete] = remove(contextModel);
    return fields;
};
//# sourceMappingURL=mutation.js.map
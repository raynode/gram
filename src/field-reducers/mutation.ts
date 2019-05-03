
import { GraphQLFieldConfigMap } from 'graphql'
import { reduce } from 'lodash'
import { ContextModel, ModelBuilder, Wrapped } from 'types'

import {
  create,
  remove,
  update,
} from 'field-types'

export const mutationFieldsReducer = <Context>(context: Wrapped<Context>) => (
  fields: any,
  model: ModelBuilder<Context, any>,
) => {
  const contextModel = model.build(context)
  if(contextModel.visibility.createMutation)
    fields[contextModel.names.fields.create] = create(contextModel)
  if(contextModel.visibility.updateMutation)
    fields[contextModel.names.fields.update] = update(contextModel)
  if(contextModel.visibility.deleteMutation)
    fields[contextModel.names.fields.delete] = remove(contextModel)
  return fields as GraphQLFieldConfigMap<any, any>
}

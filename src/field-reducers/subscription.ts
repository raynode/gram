
import { GraphQLFieldConfigMap } from 'graphql'
import { ModelBuilder, Wrapped } from 'types'

import {
  create,
  remove,
  update,
} from 'event-types'

export const subscriptionFieldsReducer = <Context>(context: Wrapped<Context>) => (
  fields: any,
  model: ModelBuilder<Context, any>,
) => {
  if(model.isInterface())
    return fields
  const contextModel = model.build(context)
  if(contextModel.visibility.createSubscription)
    fields[contextModel.names.events.create] = create(contextModel)
  if(contextModel.visibility.updateSubscription)
    fields[contextModel.names.events.update] = update(contextModel)
  if(contextModel.visibility.deleteSubscription)
    fields[contextModel.names.events.delete] = remove(contextModel)
  return fields as GraphQLFieldConfigMap<any, any>
}


import {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  isType,
} from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { memoize } from 'lodash'
import { v4 as uuid } from 'uuid'

import { defaultNamingStrategy } from 'strategies/naming'
import { ContextModel, ModelBuilder, ModelVisibility, Service, Wrapped } from 'types'

import * as DataTypes from 'data-types'
import { filter } from 'input-types'
import { toList } from 'utils'

export const createContextModel = <Context, Type>(
  model: ModelBuilder<Context, any>,
  service: Service<Type>,
  context: Wrapped<Context>,
  visibility: ModelVisibility,
) => {
  const fields: GraphQLFieldConfigMap<any, any> = {}
  const getFields = () => fields
  let contextModelIsInterface: boolean = false

  const contextModel: ContextModel<Type> = {
    id: uuid(),
    name: model.name,
    names: defaultNamingStrategy(model.name),
    addField: (name: string, field: GraphQLFieldConfig<any, any>) => fields[name] = field,
    getFields,
    setInterface: () => { contextModelIsInterface = true },
    isInterface: () => contextModelIsInterface,
    getType: memoize(() => contextModelIsInterface
      ? new GraphQLInterfaceType({
        name: model.name,
        fields: getFields,
      })
      : new GraphQLObjectType({
        name: model.name,
        fields: getFields,
        interfaces: (): any => model.getInterfaces().map(context.getModel).map(model => model.getType()),
      }),
    ),
    baseFilters: memoize(() => ({
      AND: { type: GraphQLList(GraphQLNonNull(filter(contextModel))) },
      OR: { type: GraphQLList(GraphQLNonNull(filter(contextModel))) },
      NOT: { type: filter(contextModel) },
    })),
    dataFields: memoize(type => {
      switch (type) {
        case 'create': return DataTypes.create(contextModel)
        case 'data': return DataTypes.data(contextModel)
        case 'filter': return DataTypes.filter(contextModel)
        case 'page': return DataTypes.page(contextModel)
        case 'where': return DataTypes.where(contextModel)
      }
    }),
    getPubSub: memoize(() => new PubSub()),
    getListType: memoize(() => {
      const listType = model.getListType()
      if(listType)
        return isType(listType) ? listType : context.getModel(listType.name).getType()
      return toList(contextModel.getType())
    }),
    service,
    visibility: { ...visibility },
  }
  return contextModel
}

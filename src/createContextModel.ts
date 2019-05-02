
import {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLType,
  isType,
  printType,
} from 'graphql'
import { forEach, memoize } from 'lodash'
import { v4 as uuid } from 'uuid'

import { createAttributeBuilder } from 'attributeBuilder'
import { defaultNamingStrategy } from 'strategies/naming'
import { AttributeBuilder, ContextFn, ContextModel, ContextMutator, ModelBuilder, Wrapped } from 'types'

import * as DataTypes from 'data-types'
import { filter } from 'input-types'
import { toList } from 'utils'

const createBaseModel = (name: string) => ({
  name,
})

export const createContextModel = <Context>(model: ModelBuilder<Context, any>, context: Wrapped<Context>) => {
  const fields: GraphQLFieldConfigMap<any, any> = {}
  const getFields = () => fields

  const contextModel: ContextModel = {
    id: uuid(),
    name: model.name,
    names: defaultNamingStrategy(model.name),
    addField: (name: string, field: GraphQLFieldConfig<any, any>) => fields[name] = field,
    getFields,
    getType: memoize(() => new GraphQLObjectType({
      name: model.name,
      fields: getFields,
      interfaces: (): any => model.getInterfaces().map(context.getModel).map(model => model.getType()),
    })),
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
        case 'type': return DataTypes.type(contextModel)
        case 'where': return DataTypes.where(contextModel)
      }
    }),
    getListType: memoize(() => model.getListType()
      ? context.getModel(model.getListType().name).getType()
      : toList(contextModel.getType())),
    visibility: {
      createMutation: true,
      deleteMutation: true,
      findManyQuery: true,
      findOneQuery: true,
      updateMutation: true,
      createSubscription: true,
      updateSubscription: true,
      deleteSubscription: true,
    },
  }
  return contextModel
}

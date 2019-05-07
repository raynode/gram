
import {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLInterfaceType,
  GraphQLType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  isType,
} from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { memoize, reduce } from 'lodash'
import { v4 as uuid } from 'uuid'

import { defaultNamingStrategy } from 'strategies/naming'
import { AttributeBuilder, ContextModel, FieldTypes, ModelBuilder, ModelVisibility, Service, Wrapped } from 'types'

import * as DataTypes from 'data-types'
import { filter } from 'input-types'
import { toList } from 'utils'

export const createContextModel = <Context, Type>(
  model: ModelBuilder<Context, any>,
  service: Service<Type>,
  context: Wrapped<Context>,
  visibility: ModelVisibility,
) => {
  type Attribute = AttributeBuilder<Context, Type, any>
  const buildFields = (fields: Attribute[]): GraphQLFieldConfigMap<any, any> =>
    reduce(fields, (fields, attr) => {
      fields[attr.name] = attr.build(context)
      return fields
    }, {})

  const fields: Attribute[] = []
  const getFields = () => buildFields(fields)
  let contextModelIsInterface: boolean = false

  const contextModel: ContextModel<Context, Type> = {
    addField: (field: Attribute) => {
      fields.push(field)
      return field
    },
    baseFilters: memoize(() => ({
      AND: { type: GraphQLList(GraphQLNonNull(filter(contextModel))) },
      OR: { type: GraphQLList(GraphQLNonNull(filter(contextModel))) },
      NOT: { type: filter(contextModel) },
    })),
    context,
    dataFields: memoize(type => {
      switch (type) {
        case 'create': return DataTypes.create(contextModel)
        case 'data': return DataTypes.data(contextModel)
        case 'filter': return DataTypes.filter(contextModel)
        case 'list': return DataTypes.list(contextModel)
        case 'page': return DataTypes.page(contextModel)
        case 'where': return DataTypes.where(contextModel)
      }
    }),
    getFields: () => fields,
    getListType: memoize(() => new GraphQLObjectType({
      name: contextModel.names.types.listType,
      fields: () => contextModel.dataFields('list') as GraphQLFieldConfigMap<any, any>,
      interfaces: (): any => [context.getModel('List').getType()],
    })),
    getPubSub: memoize(() => new PubSub()),
    getType: memoize(() => contextModelIsInterface
      ? new GraphQLInterfaceType({
        name: model.name,
        fields: getFields,
      })
      : new GraphQLObjectType({
        name: model.name,
        fields: getFields,
        interfaces: (): any => {
          const interfaces = model.getInterfaces()
          return model.getInterfaces().map(context.getModel).map(model => model.getType())
        },
      }),
    ),
    id: uuid(),
    isInterface: () => contextModelIsInterface,
    name: model.name,
    names: defaultNamingStrategy(model.name),
    service,
    setInterface: () => { contextModelIsInterface = true },
    visibility: { ...visibility },
  }
  return contextModel
}

import {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLType,
  isType,
} from 'graphql'
import { IFieldResolver } from 'graphql-tools'
import { memoize, reduce } from 'lodash'
import { v4 as uuid } from 'uuid'

import { defaultNamingStrategy } from './strategies/naming'
import {
  AttributeBuilder,
  ContextModel,
  FieldTypes,
  GraphQLResolverMap,
  ModelBuilder,
  ModelVisibility,
  NodeType,
  Service,
  Wrapped,
} from './types'

import { Fields } from './createBuild/types'
import { list } from './createBuild/utils'
import * as DataTypes from './data-types'
import { filter } from './input-types'
import { toList } from './utils'

export const createModel = <BuildMode, Type extends NodeType, GQLType = Type>(
  model: ModelBuilder<BuildMode, any>,
  service: Service<Type, GQLType, any>,
  buildMode: Wrapped<BuildMode>,
  visibility: ModelVisibility,
  resolvers: Record<string, IFieldResolver<GQLType, any>>,
) => {
  type Attribute = AttributeBuilder<BuildMode, Type, any>
  const fields: Attribute[] = []
  const getFields = () => null
  let buildModeModelIsInterface: boolean = false
  const names = defaultNamingStrategy(model.name)
  const filterName = names.types.filterType

  const buildModeModel: ContextModel<BuildMode, Type, GQLType> = {
    addField: (field: Attribute) => {
      fields.push(field)
      return field
    },
    baseFilters: {
      AND: { type: list(filterName, true) },
      OR: { type: list(filterName, true) },
      NOT: { type: filterName },
    },
    buildMode,
    dataFields: memoize(type => {
      switch (type) {
        case 'create':
          return DataTypes.create(buildModeModel)
        case 'data':
          return DataTypes.data(buildModeModel)
        case 'filter':
          return DataTypes.filter(buildModeModel)
        case 'list':
          return DataTypes.list(buildModeModel)
        case 'page':
          return DataTypes.page()
        case 'where':
          return DataTypes.where(buildModeModel)
      }
    }),
    getFields: () => fields,
    getType: memoize(() =>
      buildModeModelIsInterface
        ? new GraphQLInterfaceType({
            name: model.name,
            fields: getFields,
          })
        : new GraphQLObjectType({
            name: model.name,
            fields: getFields,
            interfaces: (): any => {
              const interfaces = model.getInterfaces()
              return model
                .getInterfaces()
                .map(buildMode.getModel)
                .map(model => model.getType())
            },
          }),
    ),
    id: uuid(),
    isInterface: () => buildModeModelIsInterface,
    name: model.name,
    names,
    service,
    setInterface: () => {
      buildModeModelIsInterface = true
    },
    visibility: { ...visibility },
  }
  return buildModeModel
}

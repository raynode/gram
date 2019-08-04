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

const fieldBuilderFn = <BuildMode>(
  buildMode: Wrapped<BuildMode>,
  resolvers: Record<string, IFieldResolver<any, any>>,
) => <Type extends NodeType>(
  fields: Fields<any, any>,
  attr: AttributeBuilder<BuildMode, Type, any>,
) => {
  fields[attr.name] = attr.build(buildMode)
  if (resolvers[attr.name]) fields[attr.name].resolver = resolvers[attr.name]
  return fields
}

const fieldBuilder = <BuildMode>(
  buildMode: Wrapped<BuildMode>,
  resolvers: Record<string, IFieldResolver<any, any>>,
) => <Type extends NodeType>(
  fields: Array<AttributeBuilder<BuildMode, Type, any>>,
) => reduce(fields, fieldBuilderFn(buildMode, resolvers), {})

export const createModel = <BuildMode, Type extends NodeType, GQLType = Type>(
  model: ModelBuilder<BuildMode, any>,
  service: Service<Type, GQLType, any>,
  buildMode: Wrapped<BuildMode>,
  visibility: ModelVisibility,
  resolvers: Record<string, IFieldResolver<GQLType, any>>,
) => {
  type Attribute = AttributeBuilder<BuildMode, Type, any>
  const buildFields = fieldBuilder(buildMode, resolvers)
  const fields: Attribute[] = []
  const getFields = () => buildFields(fields)
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

import {
  GraphQLFieldConfigMap,
  GraphQLInputFieldConfigMap,
  GraphQLNonNull,
  GraphQLType,
  isType,
} from 'graphql'
import { IFieldResolver } from 'graphql-tools'
import { reduce } from 'lodash'
import { v4 as uuid } from 'uuid'

import { isBuildModeGenerator } from './guards'
import { Build, GQLRecord } from './types'

import * as DataTypes from '../data-types'
import { defaultNamingStrategy, Names } from '../strategies/naming'
import {
  AttributeBuilder,
  ContextModel,
  DataType,
  ModelBuilder,
  Wrapped,
} from '../types'

export interface WithAddModel<BuildMode, Context>
  extends Build<BuildMode, Context> {
  addModel: <Type, GQLType = Type>(
    model: ModelBuilder<BuildMode, Type, GQLType>,
  ) => void
}

const list = (type: string) => `[${type}!]!`
const nonNull = (type: string) => `${type}!`

const buildAttribute = <BuildMode>(
  buildMode: BuildMode,
  attr: AttributeBuilder<BuildMode, any, any>,
  wrapped: Wrapped<BuildMode>,
) => {
  const type = attr.field(wrapped)
  const gqlType = isType(type) ? type.toString() : `${type.name}`
  if (attr.listType) return list(gqlType)
  if (!attr.nullable) return nonNull(gqlType)
  return gqlType
}

const getAttributeFields = <BuildMode, Type, GQLType>(
  buildMode: BuildMode,
  modelBuilder: ModelBuilder<BuildMode, Type, GQLType>,
  wrapped: Wrapped<BuildMode>,
) =>
  reduce(
    modelBuilder.getAttributes(),
    (fields, attr, name) => {
      fields[name] = buildAttribute(buildMode, attr, wrapped)
      return fields
    },
    {},
  )

export const convertGraphQLFieldConfigMap = (
  fieldMap: GraphQLFieldConfigMap<any, any> | GraphQLInputFieldConfigMap,
): GQLRecord =>
  reduce(
    fieldMap,
    (record, { type }, field) => {
      record[field] = type
      return record
    },
    {},
  )

export const createModelInputTypesAdder = <BuildMode, Context>(
  build: Build<BuildMode, Context>,
  model: ContextModel<BuildMode, any, any>,
) => <Key extends keyof Names, Name extends keyof Names[Key]>(
  nameType: Key,
  name: Name,
  dataType: DataType,
) =>
  build.addType((model.names[nameType] as Record<any, string>)[name], 'input', {
    fields: convertGraphQLFieldConfigMap(model.dataFields(dataType)),
  })

export const addModel = <BuildMode, Context>(
  baseBuild: Build<BuildMode, Context>,
  wrapped: Wrapped<BuildMode>,
) => {
  const build = baseBuild as WithAddModel<BuildMode, Context>
  build.addModel = modelBuilder => {
    const resolver: IFieldResolver<any, any> = modelBuilder.getResolver()
    const model = wrapped.getModel(modelBuilder.name)

    const type = modelBuilder.isInterface() ? 'interface' : 'type'
    const typeConfig = {
      fields: getAttributeFields(build.buildMode, modelBuilder, wrapped),
    }
    console.log(typeConfig.fields)
    if (type === 'interface')
      build.addType(modelBuilder.name, 'interface', typeConfig)
    else
      build.addType(modelBuilder.name, 'type', {
        ...typeConfig,
        interface: modelBuilder.getInterfaces()[0],
      })

    const addInput = createModelInputTypesAdder(build, model)
    addInput('types', 'createType', 'create')
    addInput('types', 'dataType', 'data')
    addInput('types', 'filterType', 'filter')
    addInput('types', 'orderType', 'order')
    addInput('types', 'whereType', 'where')

    // queries = {
    //   [buildModeModel.names.fields.findOne]:
    //     buildModeModel.visibility.findOneQuery &&
    //     fieldTypes.findOne(buildModeModel),
    //   [buildModeModel.names.fields.findMany]:
    //     buildModeModel.visibility.findManyQuery &&
    //     fieldTypes.findMany(buildModeModel),
    // }
    const visibility = modelBuilder.getVisibility()
    const names = defaultNamingStrategy(modelBuilder.name)
    const service = modelBuilder.getService()

    if (visibility.findOneQuery)
      build.addQuery(names.fields.findOne, modelBuilder.name, service.findOne)
    if (visibility.findManyQuery)
      build.addQuery(
        names.fields.findMany,
        list(modelBuilder.name),
        service.findMany,
      )
  }
  return build
}

import { GraphQLNonNull, GraphQLType, isType } from 'graphql'
import { IFieldResolver } from 'graphql-tools'
import { reduce } from 'lodash'

import { isBuildModeGenerator } from './guards'
import { Build } from './types'

import * as DataTypes from '../data-types'
import { defaultNamingStrategy } from '../strategies/naming'
import { AttributeBuilder, ModelBuilder } from '../types'

export interface WithAddModel<BuildMode> extends Build<BuildMode> {
  addModel: <Type, GQLType = Type>(
    model: ModelBuilder<BuildMode, Type, GQLType>,
  ) => void
}

// export const reduceContextFields = <
//   BuildMode,
//   Type extends Record<string, any>
// >(
//   buildModeModel: ContextModel<BuildMode, Type>,
//   base: Type = null,
//   reducer: (
//     memo: Type,
//     attr: AttributeBuilder<BuildMode, Type, any>,
//     type: GraphQLType,
//     field: ModelType<BuildMode>,
//   ) => Type,
// ) =>
//   buildModeModel
//     .getFields()
//     .reduce(
//       (memo: Type, attr) =>
//         reducer(
//           memo,
//           attr,
//           buildType(attr, buildModeModel.buildMode),
//           attr.field(buildModeModel.buildMode),
//         ),
//       base || {},
//     )

const fakeWrapped = <BuildMode>(buildMode: BuildMode) =>
  ({
    id: 'string',
    getBaseModel: (name: string) => name,
    getModel: (name: string) => name,
    addModel: () => null,
    filterStrategy: null,
    buildMode,
    getScalar: (key: string) => key,
    pubSub: null,
  } as any)

const list = (type: string) => `[${type}!]!`
const nonNull = (type: string) => `${type}!`

const buildAttribute = <BuildMode>(
  buildMode: BuildMode,
  attr: AttributeBuilder<BuildMode, any, any>,
) => {
  const type = attr.field(fakeWrapped(buildMode))
  const gqlType = isType(type) ? type.toString() : `${type}`
  if (attr.listType) return list(gqlType)
  if (!attr.nullable) return nonNull(gqlType)
  return gqlType
}

const getAttributeFields = <BuildMode, Type, GQLType>(
  buildMode: BuildMode,
  modelBuilder: ModelBuilder<BuildMode, Type, GQLType>,
) =>
  reduce(
    modelBuilder.getAttributes(),
    (fields, attr, name) => {
      fields[name] = buildAttribute(buildMode, attr)
      return fields
    },
    {},
  )

export const addModel = <BuildMode>(baseBuild: Build<BuildMode>) => {
  const build = baseBuild as WithAddModel<BuildMode>
  build.addModel = modelBuilder => {
    const resolver: IFieldResolver<any, any> = modelBuilder.getResolver()

    const type = modelBuilder.isInterface() ? 'interface' : 'type'
    const typeConfig = {
      fields: getAttributeFields(build.buildMode, modelBuilder),
    }
    if (type === 'interface')
      build.addType(modelBuilder.name, 'interface', typeConfig)
    else
      build.addType(modelBuilder.name, 'type', {
        ...typeConfig,
        interface: modelBuilder.getInterfaces()[0],
      })

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

    const dataFields = {
      // create: DataTypes.create(null),
      // data: DataTypes.data(null),
      // filter: DataTypes.filter(null),
      // list: DataTypes.list(null),
      // page: DataTypes.page(null),
      // where: DataTypes.where(null),
    }
    console.log(dataFields)
  }
  build.addQuery('test', 'String')
  return build
}

import { GraphQLNonNull, GraphQLType, isType } from 'graphql'
import { IFieldResolver } from 'graphql-tools'
import { reduce } from 'lodash'

import {} from '../attributeBuilder'
import { AttributeBuilder, ModelBuilder } from '../types'

import { isBuildModeGenerator } from './guards'
import { Build } from './types'

export interface WithAddModel<BuildMode> extends Build<BuildMode> {
  addModel: <Type, GQLType = Type>(
    model: ModelBuilder<BuildMode, Type, GQLType>,
  ) => void
}

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

const buildAttribute = <BuildMode>(
  buildMode: BuildMode,
  attr: AttributeBuilder<BuildMode, any, any>,
) => {
  const type = attr.field(fakeWrapped(buildMode))
  const gqlType = isType(type) ? type.toString() : type
  if (attr.listType) return `[${gqlType}!]!`
  if (!attr.nullable) return `${gqlType}!`
  return gqlType
}

export const addModel = <BuildMode>(baseBuild: Build<BuildMode>) => {
  const build = baseBuild as WithAddModel<BuildMode>
  build.addModel = modelBuilder => {
    const resolver: IFieldResolver<any, any> = modelBuilder.getResolver()

    const type = modelBuilder.isInterface() ? 'interface' : 'type'
    const typeConfig = {
      fields: reduce(
        modelBuilder.getAttributes(),
        (fields, attr, name) => {
          fields[name] = buildAttribute(build.buildMode, attr)
          return fields
        },
        {},
      ),
    }
    if (type === 'interface')
      build.addType(modelBuilder.name, 'interface', typeConfig)
    else
      build.addType(modelBuilder.name, 'type', {
        ...typeConfig,
        interface: modelBuilder.getInterfaces()[0],
      })
  }
  build.addQuery('test', 'String')
  return build
}

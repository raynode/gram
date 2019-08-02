import {
  GraphQLNonNull,
  GraphQLOutputType,
  GraphQLType,
  isType,
} from 'graphql'
import { IFieldResolver } from 'graphql-tools'
import {
  AttributeBuilder,
  ContextFn,
  ContextModel,
  ModelBuilder,
  ModelType,
  NodeType,
  Wrapped,
} from './types'
import { ATTRIBUTEBUILDER } from './types/constants'
import { toList } from './utils'

import { FieldType } from './createBuild/types'

export const buildType = <BuildMode>(
  attr: AttributeBuilder<BuildMode, any, any>,
  buildMode: Wrapped<BuildMode>,
): string => {
  const type = attr.field(buildMode).type
  // @TODO this is probably wrong, need to use listType and nullable
  if (typeof type === 'string') return type
  const gqlType = isType(type) ? type : buildMode.getModel(type).getType()
  if (attr.listType) return toList(gqlType).toString()
  if (!attr.nullable) return GraphQLNonNull(gqlType).toString()
  return gqlType.toString()
}

export const createAttributeBuilder = <
  BuildMode,
  Type extends NodeType,
  AttributeType
>(
  name: string,
  field: ContextFn<BuildMode, FieldType<any, any>>,
): AttributeBuilder<BuildMode, Type, AttributeType> => {
  let resolve: IFieldResolver<Type, any>
  const builder: AttributeBuilder<BuildMode, Type, AttributeType> = {
    name,
    field,
    nullable: true,
    listType: false,
    resolve: <Context>(resolveFn: IFieldResolver<Type, Context>) => {
      resolve = resolveFn
      return builder
    },
    getResolver: () => resolve,
    isList: (isList = true) => {
      builder.listType = true
      return builder
    },
    isNotNullable: (isNotNullable = true) => {
      builder.nullable = !isNotNullable
      return builder
    },
    build: buildMode => ({
      type: buildType<BuildMode>(builder, buildMode),
      resolve,
    }),
    type: ATTRIBUTEBUILDER,
  }
  return builder
}

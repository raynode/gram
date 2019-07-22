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
  Wrapped,
} from './types'
import { ATTRIBUTEBUILDER } from './types/constants'
import { toList } from './utils'

export const buildType = <BuildMode>(
  attr: AttributeBuilder<BuildMode, any, any>,
  buildMode: Wrapped<BuildMode>,
): GraphQLOutputType => {
  const type = attr.field(buildMode)
  const gqlType = isType(type) ? type : buildMode.getModel(type.name).getType()
  if (attr.listType) return toList(gqlType) as GraphQLOutputType
  if (!attr.nullable) return GraphQLNonNull(gqlType)
  return gqlType as GraphQLOutputType
}

export const createAttributeBuilder = <BuildMode, Type, AttributeType>(
  name: string,
  field: ContextFn<BuildMode, ModelType<BuildMode>>,
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

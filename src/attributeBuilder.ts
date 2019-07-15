import {
  GraphQLFieldResolver,
  GraphQLNonNull,
  GraphQLOutputType,
  GraphQLType,
  isType,
} from 'graphql'
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

export const buildType = <Context>(
  attr: AttributeBuilder<Context, any, any>,
  buildMode: Wrapped<Context>,
): GraphQLOutputType => {
  const type = attr.field(buildMode)
  const gqlType = isType(type) ? type : buildMode.getModel(type.name).getType()
  if (attr.listType) return toList(gqlType) as GraphQLOutputType
  if (!attr.nullable) return GraphQLNonNull(gqlType)
  return gqlType as GraphQLOutputType
}

export const createAttributeBuilder = <Context, Type, AttributeType>(
  name: string,
  field: ContextFn<Context, ModelType<Context>>,
): AttributeBuilder<Context, Type, AttributeType> => {
  let resolve: GraphQLFieldResolver<Type, Context>
  const builder: AttributeBuilder<Context, Type, AttributeType> = {
    name,
    field,
    nullable: true,
    listType: false,
    resolve: (resolveFn: GraphQLFieldResolver<Type, Context>) => {
      resolve = resolveFn
      return builder
    },
    isList: (isList = true) => {
      builder.listType = true
      return builder
    },
    isNotNullable: (isNotNullable = true) => {
      builder.nullable = !isNotNullable
      return builder
    },
    build: buildMode => ({
      type: buildType<Context>(builder, buildMode),
      resolve,
    }),
    type: ATTRIBUTEBUILDER,
  }
  return builder
}

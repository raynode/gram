
import {
  GraphQLNonNull,
  GraphQLOutputType,
  GraphQLType,
  isType,
} from 'graphql'
import {
  AttributeBuilder,
  ContextFn,
  ModelBuilder,
  Wrapped,
} from 'types'
import { toList } from 'utils'

export const buildType = <Context>(attr: AttributeBuilder<any, any>, context: Wrapped<Context>): GraphQLOutputType => {
  const type = attr.type(context)
  const gqlType = isType(type) ? type : context.getModel(type.name).getType()
  if(attr.listType)
    return toList(gqlType) as GraphQLOutputType
  if(!attr.nullable)
    return GraphQLNonNull(gqlType)
  return gqlType as GraphQLOutputType
}

export const createAttributeBuilder =
  <Context, Type>(name: string, type: ContextFn<Context, GraphQLType>): AttributeBuilder<Context, Type> => {
    const builder: AttributeBuilder<Context, Type> = {
      name,
      type,
      nullable: true,
      listType: false,
      resolve: () => builder,
      isList: (isList = true) => {
        builder.listType = true
        return builder
      },
      isNotNullable: (isNotNullable = true) => {
        builder.nullable = !isNotNullable
        return builder
      },
      build: context => ({
        type: buildType(builder, context),
      }),
    }
    return builder
  }

import {
  GraphQLField,
  GraphQLFieldConfigMap,
  GraphQLInputFieldConfigMap,
  GraphQLNonNull,
  GraphQLType,
  isEnumType,
  isType,
} from 'graphql'
import { IFieldResolver } from 'graphql-tools'
import { forEach, reduce } from 'lodash'
import { v4 as uuid } from 'uuid'

import { isBuildModeGenerator } from './guards'
import { Build, GQLRecord } from './types'
import { getParentType, isListType, isNullable, list, nonNull } from './utils'

import { buildOrderEnumValues } from '../input-types'
import { defaultNamingStrategy, Names } from '../strategies/naming'
import {
  AttributeBuilder,
  ContextModel,
  DataType,
  ModelBuilder,
  NodeType,
  Wrapped,
} from '../types'

import { Fields } from '../createBuild/types'

export interface WithAddModel<BuildMode, Context>
  extends Build<BuildMode, Context> {
  addModel: <Type extends NodeType, GQLType = Type>(
    model: ModelBuilder<BuildMode, Type, GQLType>,
  ) => void
}

const buildAttribute = <BuildMode, Context>(
  build: Build<BuildMode, Context>,
  attr: AttributeBuilder<BuildMode, any, any>,
  wrapped: Wrapped<BuildMode>,
) => {
  const field = attr.field(wrapped)
  const type = field.type
  const gqlType = isType(type) ? type.toString() : `${type}`
  if (attr.listType) return list(gqlType)
  if (!attr.nullable) return nonNull(gqlType)
  return gqlType
}

const getAttributeFields = <BuildMode, Context, Type, GQLType>(
  build: Build<BuildMode, Context>,
  attributes: Array<AttributeBuilder<BuildMode, any, any>>,
  wrapped: Wrapped<BuildMode>,
) =>
  reduce(
    attributes,
    (fields, attr) => {
      fields[attr.name] = buildAttribute(build, attr, wrapped)
      return fields
    },
    {},
  )

export const convertGraphQLFieldConfigMap = <BuildMode, Context>(
  build: Build<BuildMode, Context>,
  fieldMap: Fields<any, any>,
  isModel: (type: string) => boolean,
) =>
  reduce(
    fieldMap,
    (record, type, field) => {
      // here a type conversion is taking place, we assume the type can also be 'string'
      // console.log(type, field)
      const strType =
        typeof type === 'string'
          ? type
          : isType(type)
          ? type.toString()
          : type.type.toString()
      const parentType = getParentType(strType)
      record[field] = isModel(parentType)
        ? isNullable(strType)
          ? defaultNamingStrategy(parentType).types.whereType
          : nonNull(defaultNamingStrategy(parentType).types.whereType)
        : strType
      return record
    },
    {},
  )

export const createModelInputTypesAdder = <BuildMode, Context>(
  build: Build<BuildMode, Context>,
  model: ContextModel<BuildMode, any, any>,
  isModel: (type: string) => boolean,
) => <Key extends keyof Names, Name extends keyof Names[Key]>(
  nameType: Key,
  name: Name,
  dataType: DataType,
) =>
  build.addType((model.names[nameType] as Record<any, string>)[name], {
    type: 'input',
    fields: convertGraphQLFieldConfigMap(
      build,
      model.dataFields(dataType),
      isModel,
    ),
  })

export const addModel = <BuildMode, Context>(
  baseBuild: Build<BuildMode, Context>,
  wrapped: Wrapped<BuildMode>,
) => {
  const build = baseBuild as WithAddModel<BuildMode, Context>
  build.addModel = modelBuilder => {
    const resolver = modelBuilder.getResolver(wrapped)
    const model = modelBuilder.build(wrapped)
    const isModel = (type: string) => !!wrapped.getModel(type)
    const visibility = modelBuilder.getVisibility()
    const names = defaultNamingStrategy(modelBuilder.name)
    const service = modelBuilder.getService()
    const pubSub = wrapped.pubSub
    const type = modelBuilder.isInterface() ? 'interface' : 'type'
    const fields = model.getFields()
    const interfaces = modelBuilder.getInterfaces()
    const typeConfig = {
      fields: getAttributeFields(build, fields, wrapped),
      type,
      ...(resolver && { resolver }),
      ...(interfaces &&
        type !== 'interface' &&
        interfaces.length && {
          interface: interfaces.join('&'),
        }),
    }

    forEach(fields, field => {
      const fieldType = field.field(wrapped).type
      if (isType(fieldType) && isEnumType(fieldType))
        build.addType(fieldType.name, {
          values: fieldType.getValues().map(enumValue => enumValue.name),
        })
      const resolver = field.getResolver()
      if (resolver) build.addResolver(model.name, field.name, { resolver })
    })

    const integratedModel = ['Page', 'Node', 'List'].includes(model.name)

    build.addType(modelBuilder.name, typeConfig as any)

    if (integratedModel) return

    build.addType(names.types.listType, {
      fields: {
        page: 'Page',
        nodes: modelBuilder.isInterface()
          ? list('Node')
          : list(modelBuilder.name),
      },
      interface: 'List',
    })

    // function that connects mutations with pub sub
    const publishResult = <Result, Fn extends (...args: any[]) => Result>(
      event: string,
      resolver: Fn,
    ) => async (...args: Parameters<Fn>) => {
      const result = await resolver(...args)
      pubSub.publish(event, { node: result })
      return result
    }

    const addInput = createModelInputTypesAdder(build, model, isModel)
    addInput('types', 'createType', 'create')
    addInput('types', 'dataType', 'data')
    addInput('types', 'filterType', 'filter')
    addInput('types', 'whereType', 'where')
    addInput('types', 'pageType', 'page')

    build.addType(model.names.types.orderType, {
      values: Object.keys(buildOrderEnumValues(model)),
    })

    if (visibility.findOneQuery)
      build.addQuery(names.fields.findOne, modelBuilder.name, {
        args: {
          [names.arguments.where]: nonNull(names.types.whereType),
          [names.arguments.order]: names.types.orderType,
        },
        resolver: (_, args = {}, context) =>
          service.findOne(
            {
              order: args[names.arguments.order] || null,
              where: args[names.arguments.where],
            },
            context,
          ),
      })

    if (visibility.findManyQuery)
      build.addQuery(names.fields.findMany, names.types.listType, {
        args: {
          [names.arguments.order]: names.types.orderType,
          [names.arguments.page]: names.types.pageType,
          [names.arguments.where]: nonNull(names.types.whereType),
        },
        resolver: (_, args = {}, context) =>
          service.findMany(
            {
              order: args[names.arguments.order] || null,
              page: args[names.arguments.page] || null,
              where: args[names.arguments.where],
            },
            context,
          ),
      })

    if (visibility.createMutation)
      build.addMutation(names.fields.create, modelBuilder.name, {
        args: {
          [names.arguments.data]: nonNull(names.types.createType),
        },
        resolver: publishResult(names.events.create, (_, args = {}, context) =>
          service.create(
            {
              data: args[names.arguments.data],
            },
            context,
          ),
        ),
      })

    if (visibility.updateMutation)
      build.addMutation(names.fields.update, list(modelBuilder.name), {
        args: {
          [names.arguments.data]: nonNull(names.types.dataType),
          [names.arguments.where]: nonNull(names.types.whereType),
        },
        resolver: publishResult(names.events.update, (_, args = {}, context) =>
          service.update(
            {
              data: args[names.arguments.data],
              where: args[names.arguments.where],
            },
            context,
          ),
        ),
      })

    if (visibility.deleteMutation)
      build.addMutation(names.fields.delete, list(modelBuilder.name), {
        args: {
          [names.arguments.where]: nonNull(names.types.whereType),
        },
        resolver: publishResult(names.events.delete, (_, args = {}, context) =>
          service.remove(
            {
              where: args[names.arguments.where],
            },
            context,
          ),
        ),
      })

    if (visibility.createSubscription)
      build.addSubscription(
        names.events.create,
        {
          type: nonNull(modelBuilder.name),
        },
        {
          resolve: ({ node }) => node,
          subscribe: () => pubSub.asyncIterator(names.events.create),
        },
      )

    if (visibility.updateSubscription)
      build.addSubscription(
        names.events.update,
        {
          type: list(modelBuilder.name),
        },
        {
          resolve: ({ node }) => node,
          subscribe: () => pubSub.asyncIterator(names.events.update),
        },
      )

    if (visibility.deleteSubscription)
      build.addSubscription(
        names.events.delete,
        {
          type: list(modelBuilder.name),
        },
        {
          resolve: ({ node }) => node,
          subscribe: () => pubSub.asyncIterator(names.events.delete),
        },
      )
  }
  return build
}

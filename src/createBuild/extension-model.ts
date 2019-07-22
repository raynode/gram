import {
  GraphQLFieldConfigMap,
  GraphQLInputFieldConfigMap,
  GraphQLNonNull,
  GraphQLType,
  isType,
} from 'graphql'
import { IFieldResolver } from 'graphql-tools'
import { forEach, reduce } from 'lodash'
import { v4 as uuid } from 'uuid'

import { isBuildModeGenerator } from './guards'
import { Build, GQLRecord } from './types'

import * as DataTypes from '../data-types'
import { buildOrderEnumValues } from '../input-types'
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
  attributes: Array<AttributeBuilder<BuildMode, any, any>>,
  wrapped: Wrapped<BuildMode>,
) =>
  reduce(
    attributes,
    (fields, attr) => {
      fields[attr.name] = buildAttribute(buildMode, attr, wrapped)
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
    const resolver = modelBuilder.getResolver(wrapped)
    const model = modelBuilder.build(wrapped)

    const visibility = modelBuilder.getVisibility()
    const names = defaultNamingStrategy(modelBuilder.name)
    const service = modelBuilder.getService()
    const pubSub = wrapped.pubSub
    const type = modelBuilder.isInterface() ? 'interface' : 'type'
    const fields = model.getFields()
    const interfaces = modelBuilder.getInterfaces()
    const typeConfig = {
      fields: getAttributeFields(build.buildMode, fields, wrapped),
      resolver,
      interface: (interfaces && interfaces.join('&')) || null,
    }
    forEach(fields, field => {
      const resolver = field.getResolver()
      if (resolver) build.addResolver(model.name, field.name, { resolver })
    })

    const integratedModel = ['Page', 'Node', 'List'].includes(model.name)

    build.addType(modelBuilder.name, type as any, typeConfig)

    if (!integratedModel)
      build.addType(names.types.listType, 'type', {
        fields: {
          page: 'Page',
          nodes: list(modelBuilder.name),
        },
        interface: 'List',
      })

    if (integratedModel) return

    // function that connects mutations with pub sub
    const publishResult = <Root, Args, Context, Result>(
      event: string,
      resolver: (root: Root, args: Args, context: Context) => Promise<Result>,
    ) => async (root: Root, args: Args, context: Context) => {
      const result = await resolver(root, args, context)
      pubSub.publish(event, { node: result })
      return result
    }

    const addInput = createModelInputTypesAdder(build, model)
    addInput('types', 'createType', 'create')
    addInput('types', 'dataType', 'data')
    addInput('types', 'filterType', 'filter')
    addInput('types', 'whereType', 'where')
    addInput('types', 'pageType', 'page')

    build.addType(model.names.types.orderType, 'enum', {
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
      build.addMutation(names.fields.update, {
        type: list(modelBuilder.name),
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

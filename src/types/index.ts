import {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLType,
  Thunk,
} from 'graphql'
import { PubSub } from 'graphql-subscriptions'

import { IFieldResolver } from 'graphql-tools'

import { WithAddModel } from '../createBuild/extension-model'

import { Names } from '../strategies/naming'
import {
  ATTRIBUTEBUILDER,
  MODELBUILDER,
  SCHEMABUILDER,
} from '../types/constants'
import { Service } from '../types/service'
export * from '../types/service'

export interface Builder {
  type: string
}

export type Attributes<BuildMode, Type> = Record<
  string,
  AttributeBuilder<BuildMode, any, Type>
>

export type Fields = Thunk<GraphQLFieldConfigMap<any, any>>
export type FilterFn = (
  name: string,
  type: GraphQLType,
  list: GraphQLList<any>,
) => Record<string, { type: GraphQLType }>
export type FilterCheckFn = (
  type: GraphQLType,
  required: boolean,
  list: boolean,
  baseType: GraphQLType,
) => boolean
export type FilterMiddleware = [FilterCheckFn, FilterFn]

export type FilterStrategy = <Type extends GraphQLType = GraphQLType>(
  inputType: Type | ContextModel<any, any>,
  inputName?: string,
) => Record<string, { type: GraphQLType }>

export type DataType =
  | 'create'
  | 'filter'
  | 'data'
  | 'list'
  | 'page'
  | 'where'
  | 'order'

export type FieldTypes = 'GraphQL' | 'Model' | 'All'
export type GenericGraphQLType = 'Date'
export type FieldDefinition = Record<
  'query' | 'mutation' | 'subscription',
  GraphQLFieldConfigMap<any, any>
>

export interface ContextModel<BuildMode, Type, GQLType = Type> {
  addField: <AttributeType>(
    field: AttributeBuilder<BuildMode, Type, AttributeType>,
  ) => void
  baseFilters: () => GraphQLInputFieldConfigMap
  buildMode: Wrapped<BuildMode>
  dataFields: (
    type: DataType,
  ) => GraphQLInputFieldConfigMap | GraphQLFieldConfigMap<any, any>
  getFields: () => Array<AttributeBuilder<BuildMode, Type, any>>
  getListType: () => GraphQLType
  getType: () => GraphQLType
  id: string
  isInterface: () => boolean
  name: string
  names: Names
  service: Service<Type, GQLType>
  setInterface: () => void
  visibility: ModelVisibility
}

export interface Wrapped<BuildMode> {
  id: string
  getBaseModel: <Type, GQLType>(
    name: string,
  ) => ModelBuilder<BuildMode, Type, GQLType>
  getModel: <Type, GQLType>(
    name: string,
  ) => ContextModel<BuildMode, Type, GQLType>
  addModel: <Type, GQLType>(
    name: string,
    model: ContextModel<BuildMode, Type, GQLType>,
  ) => void
  filterStrategy: FilterStrategy
  buildMode: BuildMode | null
  getScalar: (key: string) => GraphQLScalarType
  pubSub: PubSub
}

export type ContextModelFn<Result> = <BuildMode>(
  buildModeModel: ContextModel<BuildMode, any, any>,
) => Result

export type ContextFn<BuildMode, Result = boolean> = (
  buildMode: Wrapped<BuildMode>,
) => Result
export type ContextMutator<BuildMode, Type, GQLType> = (
  model: ContextModel<BuildMode, Type, GQLType>,
  buildMode: Wrapped<BuildMode>,
) => void
export type ContextModelFieldFn<Type, GQLType> = <BuildMode>(
  buildModeModel: ContextModel<BuildMode, Type, GQLType>,
) => Type

export type WithContext<BuildMode, Type> = Type | ContextFn<BuildMode, Type>

export type ModelType<BuildMode> = GraphQLType | ContextModel<BuildMode, any>

export interface QueryTypeDefinition<
  BuildMode,
  Type,
  QueryContext,
  Args extends Record<string, any> = any
> {
  name: string
  args?: Args
  type: string | GraphQLType | ModelBuilder<BuildMode, Type>
  resolver: GraphQLFieldResolver<null, QueryContext, Args>
}
// GraphQLFieldResolver<TSource, TContext, TArgs>

export interface SchemaBuilder<BuildMode, QueryContext = any> extends Builder {
  build: (buildMode?: BuildMode | FieldDefinition) => GraphQLSchema
  interface: <Type>(
    interfaceName: string,
    service?: Service<Type>,
  ) => ModelBuilder<BuildMode, Type>
  model: <Type, GQLType = Type>(
    modelName: string,
    service?: Service<Type, GQLType>,
  ) => ModelBuilder<BuildMode, Type, GQLType>
  fields: (buildMode?: BuildMode) => FieldDefinition
  models: Record<string, ModelBuilder<BuildMode, any>>
  type: typeof SCHEMABUILDER
  setScalar: <Type extends GraphQLScalarType>(key: string, type: Type) => Type
  getScalar: (key: string) => GraphQLScalarType
  addFilter: (check: FilterCheckFn, filter: FilterFn) => this
  createBuild: (buildMode?: BuildMode) => WithAddModel<BuildMode, QueryContext>
  addQuery: <Type>(
    definition: WithContext<
      BuildMode,
      QueryTypeDefinition<BuildMode, Type, QueryContext>
    >,
  ) => this
  setPubSub: (pubSub: PubSub) => this
  // addMutation: () => this
}

export type GraphQLResolverMap<GQLType, Attrs extends string = string> = Record<
  Attrs,
  IFieldResolver<GQLType, any>
>

export interface ModelBuilder<BuildMode, Type, GQLType = Type> extends Builder {
  attr: <AttributeType>(
    attributeName: string,
    type:
      | ModelType<BuildMode>
      | ModelBuilder<BuildMode, any>
      | ContextFn<BuildMode, GraphQLType>,
  ) => AttributeBuilder<BuildMode, Type, AttributeType>
  resolve: <Attrs extends string>(
    resolver: ContextFn<BuildMode, Record<string, IFieldResolver<GQLType, any>>>,
  ) => this
  getResolver: (
    buildMode: Wrapped<BuildMode>,
  ) => Record<string, IFieldResolver<GQLType, any>>
  build: (
    buildMode: Wrapped<BuildMode>,
  ) => ContextModel<BuildMode, Type, GQLType>
  buildMode: (
    buildModeMutation: ContextMutator<BuildMode, Type, GQLType>,
  ) => this
  getAttributes: () => Attributes<BuildMode, Type>
  getInterfaces: () => string[]
  getListType: () => GraphQLType | ModelBuilder<BuildMode, any>
  getVisibility: () => ModelVisibility
  getService: () => Service<Type, GQLType>
  interface: (model: string) => this
  isInterface: () => boolean
  listType: (model: ModelBuilder<BuildMode, any>) => this
  name: string
  setInterface: () => this
  setup: ContextFn<BuildMode, void>
  type: typeof MODELBUILDER
}

export interface AttributeBuilder<BuildMode, Type, AttributeType>
  extends Builder {
  name: string
  field: ContextFn<BuildMode, GraphQLType | ContextModel<BuildMode, Type, any>>
  nullable: boolean
  listType: boolean
  resolve: (resolver: GraphQLFieldResolver<Type, any>) => this
  isList: (isList?: boolean) => this
  isNotNullable: (isNotNullable?: boolean) => this
  // buildModeType: ContextFn<BuildMode, ModelType<BuildMode>>
  build: ContextFn<BuildMode, GraphQLFieldConfig<any, any>>
  type: typeof ATTRIBUTEBUILDER
}

export interface ModelVisibility {
  createMutation: boolean
  deleteMutation: boolean
  findManyQuery: boolean
  findOneQuery: boolean
  updateMutation: boolean
  createSubscription: boolean
  updateSubscription: boolean
  deleteSubscription: boolean
}

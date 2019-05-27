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

export type Attributes<Context, Type> = Record<
  string,
  AttributeBuilder<Context, any, Type>
>

export type Fields = Thunk<GraphQLFieldConfigMap<any, any>>
export type FilterFn = (
  name: string,
  type: GraphQLType,
  list: GraphQLList<any>,
) => Record<string, { type: GraphQLType }>
export type FilterCheckFn = (type: GraphQLType) => boolean
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

export type ContextResolver<Context> = (
  context: Wrapped<Context>,
) => GraphQLFieldResolver<any, any>

export interface ContextModel<Context, Type> {
  addField: <AttributeType>(
    field: AttributeBuilder<Context, Type, AttributeType>,
  ) => void
  baseFilters: () => GraphQLInputFieldConfigMap
  context: Wrapped<Context>
  dataFields: (
    type: DataType,
  ) => GraphQLInputFieldConfigMap | GraphQLFieldConfigMap<any, any>
  getFields: () => Array<AttributeBuilder<Context, Type, any>>
  getListType: () => GraphQLType
  getPubSub: () => any
  getType: () => GraphQLType
  id: string
  isInterface: () => boolean
  name: string
  names: Names
  service: Service<Type>
  setInterface: () => void
  visibility: ModelVisibility
}

export interface Wrapped<Context> {
  id: string
  getBaseModel: <Type>(name: string) => ModelBuilder<Context, Type>
  getModel: <Type>(name: string) => ContextModel<Context, Type>
  addModel: <Type>(name: string, model: ContextModel<Context, Type>) => void
  filterStrategy: FilterStrategy
  context: Context | null
  getScalar: (key: string) => GraphQLScalarType
}

export type ContextModelFn<Result> = <Context>(
  contextModel: ContextModel<Context, any>,
) => Result

export type ContextFn<Context, Result = boolean> = (
  context: Wrapped<Context>,
) => Result
export type ContextMutator<Context, Type> = (
  model: ContextModel<Context, Type>,
  context: Wrapped<Context>,
) => void
export type ContextModelFieldFn<Type> = <Context>(
  contextModel: ContextModel<Context, Type>,
) => Type

export type ModelType<Context> = GraphQLType | ContextModel<Context, any>

export interface SchemaBuilder<Context> extends Builder {
  build: (context?: Context | FieldDefinition) => GraphQLSchema
  interface: <Type>(
    interfaceName: string,
    service?: Service<Type>,
  ) => ModelBuilder<Context, Type>
  model: <Type>(
    modelName: string,
    service?: Service<Type>,
  ) => ModelBuilder<Context, Type>
  fields: (context: Context | null) => FieldDefinition
  models: Record<string, ModelBuilder<Context, any>>
  type: typeof SCHEMABUILDER
  setScalar: <Type extends GraphQLScalarType>(key: string, type: Type) => Type
  getScalar: (key: string) => GraphQLScalarType
  addFilter: (check: FilterCheckFn, filter: FilterFn) => this
  addType: <Type>(
    name: string,
    type: Type,
    resolver: ContextResolver<Context>,
  ) => this
  // addMutation: () => this
}

export interface ModelBuilder<Context, Type> extends Builder {
  attr: <AttributeType>(
    attributeName: string,
    type:
      | ModelType<Context>
      | ModelBuilder<Context, any>
      | ContextFn<Context, GraphQLType>,
  ) => AttributeBuilder<Context, Type, AttributeType>
  build: (context: Wrapped<Context>) => ContextModel<Context, Type>
  context: (contextMutation: ContextMutator<Context, Type>) => this
  getAttributes: () => Attributes<Context, Type>
  getInterfaces: () => string[]
  getListType: () => GraphQLType | ModelBuilder<Context, any>
  interface: (model: string) => this
  isInterface: () => boolean
  listType: (model: ModelBuilder<Context, any>) => this
  name: string
  setInterface: () => this
  setup: ContextFn<Context, void>
  type: typeof MODELBUILDER
}

export interface AttributeBuilder<Context, Type, AttributeType>
  extends Builder {
  name: string
  field: ContextFn<Context, GraphQLType | ContextModel<Context, Type>>
  nullable: boolean
  listType: boolean
  resolve: (resolver: GraphQLFieldResolver<Type, any>) => this
  isList: (isList?: boolean) => this
  isNotNullable: (isNotNullable?: boolean) => this
  // contextType: ContextFn<Context, ModelType<Context>>
  build: ContextFn<Context, GraphQLFieldConfig<any, any>>
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

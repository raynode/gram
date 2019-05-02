
import {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLType,
  Thunk,
} from 'graphql'

import { Names } from 'strategies/naming'

export type Fields = Thunk<GraphQLFieldConfigMap<any, any>>

export type DataType = 'create' | 'filter' | 'data' | 'page' | 'where' | 'order'

export interface ContextModel {
  id: string
  name: string
  getFields: () => GraphQLFieldConfigMap<any, any>
  addField: (name: string, field: GraphQLFieldConfig<any, any>) => void
  getType: () => GraphQLType
  baseFilters: () => GraphQLInputFieldConfigMap
  getListType: () => GraphQLType
  dataFields: (type: DataType) => GraphQLInputFieldConfigMap | GraphQLFieldConfigMap<any, any>
  visibility: ModelVisibility
  names: Names
}

export interface Wrapped<Context> {
  getModel: (name: string) => ContextModel
  addModel: (name: string, model: ContextModel) => void
  context: Context
}

export type ContextFn<Context, Result = boolean> = (context: Wrapped<Context>) => Result
export type ContextMutator<Context> = (model: ContextModel, context: Wrapped<Context>) => void
export type ContextModelFieldFn<Type> = (contextModel: ContextModel) => Type

export type ModelType<Context> = GraphQLType | ModelBuilder<Context, any>

export interface SchemaBuilder<Context> {
  // creates a new Model and adds it to the schema
  // modelName = name of the Model in Graphql
  // contextFn = is the model visible in this context (default = true)
  model: <Type>(modelName: string, contextFn?: ContextFn<Context>) => ModelBuilder<Context, Type>
  models: Record<string, ModelBuilder<Context, any>>
  build: (context: Context) => GraphQLSchema
}

export interface ModelBuilder<Context, Type> {
  name: string
  attr: (attributeName: string, type: ModelType<Context>) => AttributeBuilder<Context, Type>
  setup: ContextFn<Context, void>
  build: (context: Wrapped<Context>) => ContextModel
  context: (contextMutation: ContextMutator<Context>) => this
  interface: (model: string) => this
  getInterfaces: () => string[]
  listType: (model: ModelBuilder<Context, any>) => this
  getListType: () => ModelBuilder<Context, any>
}

export interface AttributeBuilder<Context, Type> {
  name: string
  type: ContextFn<Context, GraphQLType | ModelBuilder<Context, Type>>
  nullable: boolean
  listType: boolean
  resolve: <Result>(resolver: (type: Type) => Result) => this
  isList: (isList?: boolean) => this
  isNotNullable: (isNotNullable?: boolean) => this
  build: ContextFn<Context, GraphQLFieldConfig<any, any>>
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

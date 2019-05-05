
import {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLType,
  Thunk,
} from 'graphql'

import { Names } from 'strategies/naming'
import { Service } from 'types/service'
export * from 'types/service'

export type Fields = Thunk<GraphQLFieldConfigMap<any, any>>

export type DataType = 'create' | 'filter' | 'data' | 'page' | 'where' | 'order'

export interface ContextModel<Type> {
  addField: (name: string, field: GraphQLFieldConfig<any, any>) => void
  baseFilters: () => GraphQLInputFieldConfigMap
  dataFields: (type: DataType) => GraphQLInputFieldConfigMap | GraphQLFieldConfigMap<any, any>
  getFields: () => GraphQLFieldConfigMap<any, any>
  setInterface: () => void
  isInterface: () => boolean
  getListType: () => GraphQLType
  getPubSub: () => any
  getType: () => GraphQLType
  id: string
  name: string
  names: Names
  service: Service<Type>
  visibility: ModelVisibility
}

export interface Wrapped<Context> {
  getModel: <Type>(name: string) => ContextModel<Type>
  addModel: <Type>(name: string, model: ContextModel<Type>) => void
  context: Context
}

export type ContextFn<Context, Result = boolean> = (context: Wrapped<Context>) => Result
export type ContextMutator<Context, Type> = (model: ContextModel<Type>, context: Wrapped<Context>) => void
export type ContextModelFieldFn<Type> = (contextModel: ContextModel<Type>) => Type

export type ModelType<Context> = GraphQLType | ModelBuilder<Context, any>

export interface SchemaBuilder<Context> {
  // creates a new Model and adds it to the schema
  // modelName = name of the Model in Graphql
  // contextFn = is the model visible in this context (default = true)
  model: <Type>(modelName: string, service?: Service<Type>, contextFn?: ContextMutator<Context, Type>) =>
    ModelBuilder<Context, Type>
  interface: <Type>(interfaceName: string, service?: Service<Type>, contextFn?: ContextMutator<Context, Type>) =>
    ModelBuilder<Context, Type>
  models: Record<string, ModelBuilder<Context, any>>
  build: (context: Context) => GraphQLSchema
  setNodeType: (nodeType: GraphQLType | ModelBuilder<Context, any>) => this
  setPageType: (pageType: GraphQLType | ModelBuilder<Context, any>) => this
}

export interface ModelBuilder<Context, Type> {
  attr: (attributeName: string, type: ModelType<Context>) => AttributeBuilder<Context, Type>
  build: (context: Wrapped<Context>) => ContextModel<Type>
  context: (contextMutation: ContextMutator<Context, Type>) => this
  getInterfaces: () => string[]
  getListType: () => GraphQLType | ModelBuilder<Context, any>
  interface: (model: string) => this
  isInterface: () => boolean
  listType: (model: ModelBuilder<Context, any>) => this
  name: string
  setInterface: () => this
  setup: ContextFn<Context, void>
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

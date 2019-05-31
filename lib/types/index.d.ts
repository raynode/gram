import { GraphQLFieldConfig, GraphQLFieldConfigMap, GraphQLFieldResolver, GraphQLInputFieldConfigMap, GraphQLList, GraphQLScalarType, GraphQLSchema, GraphQLType, Thunk } from 'graphql';
import { Names } from '../strategies/naming';
import { ATTRIBUTEBUILDER, MODELBUILDER, SCHEMABUILDER } from '../types/constants';
import { Service } from '../types/service';
export * from '../types/service';
export interface Builder {
    type: string;
}
export declare type Attributes<Context, Type> = Record<string, AttributeBuilder<Context, any, Type>>;
export declare type Fields = Thunk<GraphQLFieldConfigMap<any, any>>;
export declare type FilterFn = (name: string, type: GraphQLType, list: GraphQLList<any>) => Record<string, {
    type: GraphQLType;
}>;
export declare type FilterCheckFn = (type: GraphQLType) => boolean;
export declare type FilterMiddleware = [FilterCheckFn, FilterFn];
export declare type FilterStrategy = <Type extends GraphQLType = GraphQLType>(inputType: Type | ContextModel<any, any>, inputName?: string) => Record<string, {
    type: GraphQLType;
}>;
export declare type DataType = 'create' | 'filter' | 'data' | 'list' | 'page' | 'where' | 'order';
export declare type FieldTypes = 'GraphQL' | 'Model' | 'All';
export declare type GenericGraphQLType = 'Date';
export declare type FieldDefinition = Record<'query' | 'mutation' | 'subscription', GraphQLFieldConfigMap<any, any>>;
export interface ContextModel<Context, Type, GQLType = Type> {
    addField: <AttributeType>(field: AttributeBuilder<Context, Type, AttributeType>) => void;
    baseFilters: () => GraphQLInputFieldConfigMap;
    context: Wrapped<Context>;
    dataFields: (type: DataType) => GraphQLInputFieldConfigMap | GraphQLFieldConfigMap<any, any>;
    getFields: () => Array<AttributeBuilder<Context, Type, any>>;
    getListType: () => GraphQLType;
    getPubSub: () => any;
    getType: () => GraphQLType;
    id: string;
    isInterface: () => boolean;
    name: string;
    names: Names;
    service: Service<Type, GQLType>;
    setInterface: () => void;
    visibility: ModelVisibility;
}
export interface Wrapped<Context> {
    id: string;
    getBaseModel: <Type, GQLType>(name: string) => ModelBuilder<Context, Type, GQLType>;
    getModel: <Type, GQLType>(name: string) => ContextModel<Context, Type, GQLType>;
    addModel: <Type, GQLType>(name: string, model: ContextModel<Context, Type, GQLType>) => void;
    filterStrategy: FilterStrategy;
    context: Context | null;
    getScalar: (key: string) => GraphQLScalarType;
}
export declare type ContextModelFn<Result> = <Context>(contextModel: ContextModel<Context, any, any>) => Result;
export declare type ContextFn<Context, Result = boolean> = (context: Wrapped<Context>) => Result;
export declare type ContextMutator<Context, Type, GQLType> = (model: ContextModel<Context, Type, GQLType>, context: Wrapped<Context>) => void;
export declare type ContextModelFieldFn<Type, GQLType> = <Context>(contextModel: ContextModel<Context, Type, GQLType>) => Type;
export declare type WithContext<Context, Type> = Type | ContextFn<Context, Type>;
export declare type ModelType<Context> = GraphQLType | ContextModel<Context, any>;
export interface QueryTypeDefinition<Context, Type, QueryContext, Args extends Record<string, any> = any> {
    name: string;
    args?: Args;
    type: GraphQLType | ModelBuilder<Context, Type>;
    resolver: GraphQLFieldResolver<null, QueryContext, Args>;
}
export interface SchemaBuilder<Context, QueryContext = any> extends Builder {
    build: (context?: Context | FieldDefinition) => GraphQLSchema;
    interface: <Type>(interfaceName: string, service?: Service<Type>) => ModelBuilder<Context, Type>;
    model: <Type, GQLType = Type>(modelName: string, service?: Service<Type, GQLType>) => ModelBuilder<Context, Type, GQLType>;
    fields: (context: Context | null) => FieldDefinition;
    models: Record<string, ModelBuilder<Context, any>>;
    type: typeof SCHEMABUILDER;
    setScalar: <Type extends GraphQLScalarType>(key: string, type: Type) => Type;
    getScalar: (key: string) => GraphQLScalarType;
    addFilter: (check: FilterCheckFn, filter: FilterFn) => this;
    addQuery: <Type>(definition: WithContext<Context, QueryTypeDefinition<Context, Type, QueryContext>>) => this;
}
export interface ModelBuilder<Context, Type, GQLType = Type> extends Builder {
    attr: <AttributeType>(attributeName: string, type: ModelType<Context> | ModelBuilder<Context, any> | ContextFn<Context, GraphQLType>) => AttributeBuilder<Context, Type, AttributeType>;
    build: (context: Wrapped<Context>) => ContextModel<Context, Type, GQLType>;
    context: (contextMutation: ContextMutator<Context, Type, GQLType>) => this;
    getAttributes: () => Attributes<Context, Type>;
    getInterfaces: () => string[];
    getListType: () => GraphQLType | ModelBuilder<Context, any>;
    interface: (model: string) => this;
    isInterface: () => boolean;
    listType: (model: ModelBuilder<Context, any>) => this;
    name: string;
    setInterface: () => this;
    setup: ContextFn<Context, void>;
    type: typeof MODELBUILDER;
}
export interface AttributeBuilder<Context, Type, AttributeType> extends Builder {
    name: string;
    field: ContextFn<Context, GraphQLType | ContextModel<Context, Type, any>>;
    nullable: boolean;
    listType: boolean;
    resolve: (resolver: GraphQLFieldResolver<Type, any>) => this;
    isList: (isList?: boolean) => this;
    isNotNullable: (isNotNullable?: boolean) => this;
    build: ContextFn<Context, GraphQLFieldConfig<any, any>>;
    type: typeof ATTRIBUTEBUILDER;
}
export interface ModelVisibility {
    createMutation: boolean;
    deleteMutation: boolean;
    findManyQuery: boolean;
    findOneQuery: boolean;
    updateMutation: boolean;
    createSubscription: boolean;
    updateSubscription: boolean;
    deleteSubscription: boolean;
}

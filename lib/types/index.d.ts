import { GraphQLFieldConfig, GraphQLFieldConfigMap, GraphQLFieldResolver, GraphQLInputFieldConfigMap, GraphQLList, GraphQLSchema, GraphQLType, Thunk } from 'graphql';
import { Names } from '../strategies/naming';
import { ATTRIBUTEBUILDER, MODELBUILDER, SCHEMABUILDER } from '../types/constants';
import { Service } from '../types/service';
export * from '../types/service';
export interface Builder {
    type: string;
}
export declare type Fields = Thunk<GraphQLFieldConfigMap<any, any>>;
export declare type FilterFn = (name: string, type: GraphQLType, list: GraphQLList<any>) => Record<string, {
    type: GraphQLType;
}>;
export declare type FilterCheckFn = (type: GraphQLType) => boolean;
export declare type FilterMiddleware = [FilterCheckFn, FilterFn];
export declare type DataType = 'create' | 'filter' | 'data' | 'list' | 'page' | 'where' | 'order';
export declare type FieldTypes = 'GraphQL' | 'Model' | 'All';
export declare type GenericGraphQLType = 'Date' | 'JSON';
export declare type FieldDefinition = Record<'query' | 'mutation' | 'subscription', GraphQLFieldConfigMap<any, any>>;
export interface ContextModel<Context, Type> {
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
    service: Service<Type>;
    setInterface: () => void;
    visibility: ModelVisibility;
}
export interface Wrapped<Context> {
    id: string;
    getModel: <Type>(name: string) => ContextModel<Context, Type>;
    addModel: <Type>(name: string, model: ContextModel<Context, Type>) => void;
    context: Context | null;
    getGenericType: (key: string) => GraphQLType;
}
export declare type ContextModelFn<Result> = <Context>(contextModel: ContextModel<Context, any>) => Result;
export declare type ContextFn<Context, Result = boolean> = (context: Wrapped<Context>) => Result;
export declare type ContextMutator<Context, Type> = (model: ContextModel<Context, Type>, context: Wrapped<Context>) => void;
export declare type ContextModelFieldFn<Type> = <Context>(contextModel: ContextModel<Context, Type>) => Type;
export declare type ModelType<Context> = GraphQLType | ContextModel<Context, any>;
export interface SchemaBuilder<Context> extends Builder {
    build: (context?: Context | FieldDefinition) => GraphQLSchema;
    interface: <Type>(interfaceName: string, service?: Service<Type>) => ModelBuilder<Context, Type>;
    model: <Type>(modelName: string, service?: Service<Type>) => ModelBuilder<Context, Type>;
    fields: (context: Context | null) => FieldDefinition;
    models: Record<string, ModelBuilder<Context, any>>;
    type: typeof SCHEMABUILDER;
    setGenericType: <Type extends GraphQLType>(key: GenericGraphQLType, type: Type) => this;
    getGenericType: (key: GenericGraphQLType) => GraphQLType;
}
export interface ModelBuilder<Context, Type> extends Builder {
    attr: <AttributeType>(attributeName: string, type: ModelType<Context> | ModelBuilder<Context, any> | ContextFn<Context, GraphQLType>) => AttributeBuilder<Context, Type, AttributeType>;
    build: (context: Wrapped<Context>) => ContextModel<Context, Type>;
    context: (contextMutation: ContextMutator<Context, Type>) => this;
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
    field: ContextFn<Context, GraphQLType | ContextModel<Context, Type>>;
    nullable: boolean;
    listType: boolean;
    resolve: (resolver: GraphQLFieldResolver<Type, Context>) => this;
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

/// <reference types="lodash" />
import { GraphQLFieldConfigMap, GraphQLInputFieldConfigMap, GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLType } from 'graphql';
import { AttributeBuilder, ContextFn, ContextModel, ContextModelFn, DataType, ModelBuilder, ModelType, PageData, WithContext, Wrapped } from './types';
export declare const isContextFn: <Context, Type>(val: any) => val is ContextFn<Context, Type>;
export declare const extractData: <Context, Type>(data: WithContext<Context, Type>) => (context: Wrapped<Context>) => Type;
export declare const record: (service: Record<string, any>) => {
    exists: (key: string) => boolean;
};
export declare const clearRecord: (record: Record<string, any>) => import("lodash").Dictionary<any>;
export declare type FieldReducerFn<Context> = (fields: GraphQLFieldConfigMap<any, any>, model: ModelBuilder<Context, any>) => GraphQLFieldConfigMap<any, any>;
export declare const fieldsReducer: <Context>(reducer: (contextModel: ContextModel<Context, any>) => GraphQLFieldConfigMap<any, any, {
    [key: string]: any;
}> | GraphQLInputFieldConfigMap) => (context: Wrapped<Context>) => FieldReducerFn<Context>;
export declare const reduceFields: <Context, Reducers, Models, ReducerKeys extends keyof Reducers>(models: Record<string, ModelBuilder<Context, any>>, reducers: Record<ReducerKeys, FieldReducerFn<Context>>, fields: Record<ReducerKeys, GraphQLFieldConfigMap<any, any, {
    [key: string]: any;
}>>) => Record<ReducerKeys, GraphQLFieldConfigMap<any, any, {
    [key: string]: any;
}>>;
export declare type ToContextFnResult<Context> = ContextFn<Context, GraphQLType | ContextModel<Context, any>>;
export declare const toContextFn: <Context>(type: import("graphql").GraphQLObjectType<any, any, {
    [key: string]: any;
}> | import("graphql").GraphQLScalarType | import("graphql").GraphQLInterfaceType | import("graphql").GraphQLUnionType | import("graphql").GraphQLEnumType | GraphQLInputObjectType | GraphQLList<any> | GraphQLNonNull<any> | ContextModel<Context, any> | ModelBuilder<Context, any> | ContextFn<Context, GraphQLType>) => ContextFn<Context, ModelType<Context>>;
export declare type TypeCondition = 'nonnull' | 'list' | 'none';
export declare const toList: <Type extends GraphQLType = GraphQLType>(type: Type) => Type;
export declare const conditionalList: <Type extends GraphQLType>(type: Type, isList: boolean) => Type;
export declare const conditionalNonNull: <Type extends GraphQLType>(type: Type, nonNull: boolean) => Type | GraphQLNonNull<import("graphql").GraphQLNullableType>;
export declare const conditionalType: <Type extends GraphQLType>(type: Type, condition: TypeCondition) => Type | GraphQLNonNull<import("graphql").GraphQLNullableType>;
export declare const memoizeContextModel: <Context, Result, Type = any>(fn: (contextModel: ContextModel<Context, Type>) => Result) => ((contextModel: ContextModel<Context, Type>) => Result) & import("lodash").MemoizedFunction;
export declare const reduceContextFields: <Context, Type extends Record<string, any>>(contextModel: ContextModel<Context, Type>, base: Type, reducer: (memo: Type, attr: AttributeBuilder<Context, Type, any>, type: GraphQLType, field: ModelType<Context>) => Type) => {};
export declare const createPageType: <Type>(page: PageData, nodes: Type[]) => {
    page: PageData;
    nodes: Type[];
};
interface ContextModelFieldFnConfig {
    iterator: string;
    condition: TypeCondition;
}
export declare const createContextModelFieldFn: <Context>(configFn: (contextModel: ContextModel<Context, any>) => ContextModelFieldFnConfig) => (contextModel: ContextModel<Context, any>) => {
    subscribe: () => any;
    resolve: ({ node }: {
        node: any;
    }) => any;
    type: import("graphql").GraphQLScalarType | import("graphql").GraphQLEnumType | GraphQLInputObjectType | GraphQLList<any> | GraphQLNonNull<import("graphql").GraphQLScalarType | import("graphql").GraphQLEnumType | GraphQLInputObjectType | GraphQLList<any>> | GraphQLNonNull<import("graphql").GraphQLNullableType>;
};
export declare const createInputType: <Context>(field: DataType, nameFn: ContextModelFn<string>) => ((contextModel: ContextModel<{}, any>) => GraphQLInputObjectType) & import("lodash").MemoizedFunction;
export {};

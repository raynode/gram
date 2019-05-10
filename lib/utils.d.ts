/// <reference types="lodash" />
import { GraphQLList, GraphQLNonNull, GraphQLType } from 'graphql';
import { AttributeBuilder, ContextFn, ContextModel, ModelBuilder, ModelType, PageData } from './types';
export declare const record: (service: Record<string, any>) => {
    exists: (key: string) => boolean;
};
export declare type ToContextFnResult<Context> = ContextFn<Context, GraphQLType | ContextModel<Context, any>>;
export declare const toContextFn: <Context>(type: import("graphql").GraphQLObjectType<any, any, {
    [key: string]: any;
}> | import("graphql").GraphQLScalarType | import("graphql").GraphQLInterfaceType | import("graphql").GraphQLUnionType | import("graphql").GraphQLEnumType | import("graphql").GraphQLInputObjectType | GraphQLList<any> | GraphQLNonNull<any> | ContextModel<Context, any> | ModelBuilder<Context, any> | ContextFn<Context, GraphQLType>) => ContextFn<Context, ModelType<Context>>;
export declare const toList: <Type extends GraphQLType = GraphQLType>(type: Type) => Type;
export declare const conditionalNonNull: <Type extends GraphQLType>(type: Type, nonNull: boolean) => Type | GraphQLNonNull<import("graphql").GraphQLNullableType>;
export declare const memoizeContextModel: <Context, Result, Type = any>(fn: (contextModel: ContextModel<Context, Type>) => Result) => ((contextModel: ContextModel<Context, Type>) => Result) & import("lodash").MemoizedFunction;
export declare const reduceContextFields: <Context, Type extends Record<string, any>>(contextModel: ContextModel<Context, Type>, base: Type, reducer: (memo: Type, attr: AttributeBuilder<Context, Type, any>, type: GraphQLType, field: ModelType<Context>) => Type) => {};
export declare const createPageType: <Type>(pageData: PageData, nodes: Type[]) => {
    page: PageData;
    nodes: Type[];
};

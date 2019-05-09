/// <reference types="lodash" />
import { GraphQLNonNull, GraphQLType } from 'graphql';
import { AttributeBuilder, ContextModel, ModelType, PageData } from './types';
export declare const toList: <Type extends GraphQLType = GraphQLType>(type: Type) => Type;
export declare const conditionalNonNull: <Type extends GraphQLType>(type: Type, nonNull: boolean) => Type | GraphQLNonNull<import("graphql").GraphQLNullableType>;
export declare const memoizeContextModel: <Context, Result, Type = any>(fn: (contextModel: ContextModel<Context, Type>) => Result) => ((contextModel: ContextModel<Context, Type>) => Result) & import("lodash").MemoizedFunction;
export declare const reduceContextFields: <Context, Type extends Record<string, any>>(contextModel: ContextModel<Context, Type>, base: Type, reducer: (memo: Type, attr: AttributeBuilder<Context, Type, any>, type: GraphQLType, field: ModelType<Context>) => Type) => {};
export declare const createPageType: <Type>(pageData: PageData, nodes: Type[]) => {
    page: PageData;
    nodes: Type[];
};

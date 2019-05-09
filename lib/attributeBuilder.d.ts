import { GraphQLOutputType } from 'graphql';
import { AttributeBuilder, ContextFn, ModelType, Wrapped } from 'types';
export declare const buildType: <Context>(attr: AttributeBuilder<Context, any, any>, context: Wrapped<Context>) => GraphQLOutputType;
export declare const createAttributeBuilder: <Context, Type, AttributeType>(name: string, field: ContextFn<Context, ModelType<Context>>) => AttributeBuilder<Context, Type, AttributeType>;

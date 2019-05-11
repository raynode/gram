import { AttributeBuilder, Builder, ModelBuilder, SchemaBuilder } from '../types';
export declare const isBuilder: (val: any) => val is Builder;
export declare const isAttributeBuilder: <Context, Type, AttributeType>(val: any) => val is AttributeBuilder<Context, Type, AttributeType>;
export declare const isModelBuilder: <Context, Type>(val: any) => val is ModelBuilder<Context, Type>;
export declare const isSchemaBuilder: <Context>(val: any) => val is SchemaBuilder<Context>;
export declare const isFieldDefinition: (val: any) => val is Record<import("graphql").OperationTypeNode, import("graphql").GraphQLFieldConfigMap<any, any, {
    [key: string]: any;
}>>;

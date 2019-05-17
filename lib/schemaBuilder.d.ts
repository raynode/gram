import { GraphQLFieldConfigMap, GraphQLSchema } from 'graphql';
import { SchemaBuilder } from './types';
export declare const createSchema: (definition: Record<import("graphql").OperationTypeNode, GraphQLFieldConfigMap<any, any, {
    [key: string]: any;
}>>) => GraphQLSchema;
export declare const createSchemaBuilder: <Context = any>() => SchemaBuilder<Context>;

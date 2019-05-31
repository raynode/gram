import { ContextMutator, ModelBuilder, Service } from './types';
export declare const createModelBuilder: <Context, Type, GQLType = Type>(modelName: string, service: Service<Type, GQLType>, contextFn?: ContextMutator<Context, Type, GQLType>) => ModelBuilder<Context, Type, GQLType>;

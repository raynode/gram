import { ContextMutator, ModelBuilder, Service } from 'types';
export declare const createModelBuilder: <Context, Type>(modelName: string, service: Service<Type>, contextFn?: ContextMutator<Context, Type>) => ModelBuilder<Context, Type>;

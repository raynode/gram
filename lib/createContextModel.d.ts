import { ContextModel, ModelBuilder, ModelVisibility, Service, Wrapped } from './types';
export declare const createContextModel: <Context, Type>(model: ModelBuilder<Context, any>, service: Service<Type, Type>, context: Wrapped<Context>, visibility: ModelVisibility) => ContextModel<Context, Type>;

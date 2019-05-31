import { ContextModel, ModelBuilder, ModelVisibility, Service, Wrapped } from './types';
export declare const createContextModel: <Context, Type, GQLType = Type>(model: ModelBuilder<Context, any, any>, service: Service<Type, GQLType>, context: Wrapped<Context>, visibility: ModelVisibility) => ContextModel<Context, Type, GQLType>;

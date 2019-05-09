/// <reference types="lodash" />
import { GraphQLInputObjectType } from 'graphql';
import { ContextModel } from '../types';
export declare const create: ((contextModel: ContextModel<{}, any>) => GraphQLInputObjectType) & import("lodash").MemoizedFunction;

import { NodeType, Service } from 'types';
export interface Page {
    limit: number;
    offset: number;
    page: number;
}
export interface Paged<Type> {
    page: Page;
    nodes: Type[];
}
export interface Account extends NodeType {
    id: string;
    name: string;
    amount: number;
    userId: string;
}
export interface User extends NodeType {
    id: string;
    name: string;
    accounts: string[];
    friends: string[];
}
export declare let db: Record<string, NodeType>;
export declare const findMany: <Type>(where: any, order: any) => Type[];
export declare const Nodes: Service<NodeType>;
export declare const Accounts: Service<Account>;
export declare const Users: Service<User>;
export declare const reset: () => void;

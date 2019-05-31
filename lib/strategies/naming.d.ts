export declare type Arguments = 'data' | 'filter' | 'order' | 'page' | 'where';
export declare type Events = 'create' | 'delete' | 'update';
export declare type Fields = 'create' | 'delete' | 'findMany' | 'findOne' | 'update';
export declare type Types = 'createType' | 'dataType' | 'filterType' | 'listType' | 'orderType' | 'pageType' | 'whereType';
export interface Names {
    arguments: Record<Arguments, string>;
    events: Record<Events, string>;
    fields: Record<Fields, string>;
    types: Record<Types, string>;
}
export declare type NamingStrategy<Models = any> = (name: string) => Names;
export declare const defaultNamingStrategy: NamingStrategy;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inflection_1 = require("inflection");
exports.defaultNamingStrategy = name => ({
    arguments: {
        data: 'data',
        order: 'order',
        filter: 'filter',
        page: 'page',
        where: 'where',
    },
    events: {
        create: `onCreate${inflection_1.singularize(name.toString())}`,
        delete: `onDelete${inflection_1.pluralize(name.toString())}`,
        update: `onUpdate${inflection_1.singularize(name.toString())}`,
    },
    fields: {
        create: `create${inflection_1.singularize(name.toString())}`,
        delete: `delete${inflection_1.pluralize(name.toString())}`,
        findMany: `get${inflection_1.pluralize(name.toString())}`,
        findOne: `get${inflection_1.singularize(name.toString())}`,
        update: `update${inflection_1.singularize(name.toString())}`,
    },
    types: {
        createType: `Create${inflection_1.singularize(name.toString())}Data`,
        dataType: `Update${inflection_1.singularize(name.toString())}Data`,
        filterType: `${inflection_1.singularize(name.toString())}Filter`,
        orderType: `${inflection_1.singularize(name.toString())}SortOrder`,
        pageType: `${inflection_1.singularize(name.toString())}Page`,
        whereType: `${inflection_1.singularize(name.toString())}Where`,
        listType: `${inflection_1.pluralize(name.toString())}`,
    },
});
//# sourceMappingURL=naming.js.map
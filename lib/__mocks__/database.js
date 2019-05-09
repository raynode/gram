import { reduce } from 'lodash';
import { v4 as uuid } from 'uuid';
import { createPageType } from 'index';
// services
export let db = {};
const createNode = (data) => {
    data.id = uuid();
    db[data.id] = data;
    return data;
};
const deleteNodes = (where) => {
    const nodes = findMany(where, null);
    nodes.forEach(node => delete db[node.id]);
    return nodes;
};
const appliesToWhere = (node, where) => {
    if (!where)
        return true;
    return Object.keys(where).reduce((valid, key) => valid && where[key] === node[key], true);
};
export const findMany = (where, order) => reduce(db, (many, entry, key) => {
    if (appliesToWhere(entry, where))
        many.push(entry);
    return many;
}, []);
const findOne = (where, order) => findMany(where, order)[0];
const pagedFindMany = (where, order) => createPageType(order, findMany(where, order));
export const Nodes = {
    findOne: async ({ where, order }) => findOne(where, order),
    findMany: async ({ where, order }) => pagedFindMany(where, order),
};
export const Accounts = {
    create: async ({ data }) => {
        const account = {
            name: data.name,
            userId: data.user.id,
        };
        return createNode(account);
    },
    findMany: async ({ where, order }) => pagedFindMany(where, order),
    findOne: async ({ where, order }) => findOne(where, order),
    remove: async ({ where }) => deleteNodes(where),
    update: async () => null,
};
export const Users = {
    create: async ({ data }) => createNode(data),
    findMany: async ({ where, order }) => pagedFindMany(where, order),
    findOne: async ({ where, order }) => findOne(where, order),
    remove: async ({ where }) => deleteNodes(where),
    update: async () => null,
};
export const reset = () => {
    const user1 = {
        id: '1',
        name: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        accounts: [],
        friends: [],
    };
    db = {
        1: user1,
    };
};
//# sourceMappingURL=database.js.map
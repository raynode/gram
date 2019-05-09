var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    findOne: ({ where, order }) => __awaiter(this, void 0, void 0, function* () { return findOne(where, order); }),
    findMany: ({ where, order }) => __awaiter(this, void 0, void 0, function* () { return pagedFindMany(where, order); }),
};
export const Accounts = {
    create: ({ data }) => __awaiter(this, void 0, void 0, function* () {
        const account = {
            name: data.name,
            userId: data.user.id,
        };
        return createNode(account);
    }),
    findMany: ({ where, order }) => __awaiter(this, void 0, void 0, function* () { return pagedFindMany(where, order); }),
    findOne: ({ where, order }) => __awaiter(this, void 0, void 0, function* () { return findOne(where, order); }),
    remove: ({ where }) => __awaiter(this, void 0, void 0, function* () { return deleteNodes(where); }),
    update: () => __awaiter(this, void 0, void 0, function* () { return null; }),
};
export const Users = {
    create: ({ data }) => __awaiter(this, void 0, void 0, function* () { return createNode(data); }),
    findMany: ({ where, order }) => __awaiter(this, void 0, void 0, function* () { return pagedFindMany(where, order); }),
    findOne: ({ where, order }) => __awaiter(this, void 0, void 0, function* () { return findOne(where, order); }),
    remove: ({ where }) => __awaiter(this, void 0, void 0, function* () { return deleteNodes(where); }),
    update: () => __awaiter(this, void 0, void 0, function* () { return null; }),
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
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const uuid_1 = require("uuid");
const index_1 = require("index");
// services
exports.db = {};
const createNode = (data) => {
    data.id = uuid_1.v4();
    exports.db[data.id] = data;
    return data;
};
const deleteNodes = (where) => {
    const nodes = exports.findMany(where, null);
    nodes.forEach(node => delete exports.db[node.id]);
    return nodes;
};
const appliesToWhere = (node, where) => {
    if (!where)
        return true;
    return Object.keys(where).reduce((valid, key) => valid && where[key] === node[key], true);
};
exports.findMany = (where, order) => lodash_1.reduce(exports.db, (many, entry, key) => {
    if (appliesToWhere(entry, where))
        many.push(entry);
    return many;
}, []);
const findOne = (where, order) => exports.findMany(where, order)[0];
const pagedFindMany = (where, order) => index_1.createPageType(order, exports.findMany(where, order));
exports.Nodes = {
    findOne: ({ where, order }) => __awaiter(this, void 0, void 0, function* () { return findOne(where, order); }),
    findMany: ({ where, order }) => __awaiter(this, void 0, void 0, function* () { return pagedFindMany(where, order); }),
};
exports.Accounts = {
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
exports.Users = {
    create: ({ data }) => __awaiter(this, void 0, void 0, function* () { return createNode(data); }),
    findMany: ({ where, order }) => __awaiter(this, void 0, void 0, function* () { return pagedFindMany(where, order); }),
    findOne: ({ where, order }) => __awaiter(this, void 0, void 0, function* () { return findOne(where, order); }),
    remove: ({ where }) => __awaiter(this, void 0, void 0, function* () { return deleteNodes(where); }),
    update: () => __awaiter(this, void 0, void 0, function* () { return null; }),
};
exports.reset = () => {
    const user1 = {
        id: '1',
        name: 'test',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        accounts: [],
        friends: [],
    };
    exports.db = {
        1: user1,
    };
};
//# sourceMappingURL=database.js.map
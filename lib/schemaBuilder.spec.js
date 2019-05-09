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
const graphql_1 = require("graphql");
const schemaBuilder_1 = require("schemaBuilder");
const database_1 = require("__mocks__/database");
describe('schemaBuilder', () => {
    let builder;
    beforeEach(() => {
        builder = schemaBuilder_1.createSchemaBuilder();
    });
    it('should have basic methods', () => {
        expect(builder).toHaveProperty('model');
        expect(typeof builder.model).toBe('function');
    });
    it('should render an empty Schema', () => {
        expect(graphql_1.printSchema(builder.build(0))).toMatchSnapshot();
    });
});
describe('example', () => {
    let builder;
    beforeAll(() => {
        database_1.reset();
        builder = schemaBuilder_1.createSchemaBuilder();
    });
    const addNodeAttributes = (node) => {
        node.attr('id', graphql_1.GraphQLID);
        node.attr('createdAt', graphql_1.GraphQLString);
        node.attr('updatedAt', graphql_1.GraphQLString);
        node.attr('deletedAt', graphql_1.GraphQLString);
        return node;
    };
    it('should add User to the Schema', () => {
        const user = builder.model('User', database_1.Users);
        user.attr('name', graphql_1.GraphQLString);
        user.attr('friends', user).isList();
        const schema = builder.build(0);
        expect(graphql_1.printSchema(schema)).toMatchSnapshot();
    });
    it('should add account to the model', () => {
        const account = addNodeAttributes(builder.model('Account', database_1.Accounts));
        // will add input types for "STRING"
        account.attr('name', graphql_1.GraphQLString);
        account.attr('amount', graphql_1.GraphQLFloat);
        // will add input types for "REFERENCE"
        account
            .attr('user', builder.models.User)
            .resolve(account => database_1.Users.findOne({ where: { id: account.userId }, order: null }))
            .isNotNullable();
        // add accounts to the user model
        builder.models.User
            .attr('accounts', account)
            .resolve(user => database_1.findMany({ userId: user.id }, null))
            .isList();
        expect(graphql_1.printSchema(builder.build(0))).toMatchSnapshot();
    });
    it('should be able read from the schema', () => __awaiter(this, void 0, void 0, function* () {
        const schema = builder.build(0);
        const query = `{
      getUser(where: {
        id: "1",
      }) {
        name
      }
    }`;
        const { data } = yield graphql_1.graphql(schema, query, null);
        expect(data).toMatchSnapshot();
    }));
    it('should be able to create an instance', () => __awaiter(this, void 0, void 0, function* () {
        const schema = builder.build(0);
        const query = `mutation {
      createUser(data: {
        name: "New Test-User",
      }) {
        name
      }
    }`;
        const { data, errors } = yield graphql_1.graphql(schema, query, null);
        expect(data).toHaveProperty('createUser');
        expect(data.createUser).toHaveProperty('name');
        expect(data.createUser.name).toEqual('New Test-User');
    }));
    it('should find multiple things', () => __awaiter(this, void 0, void 0, function* () {
        const schema = builder.build(0);
        // where is required by may be an empty thing
        const query = `{
      getUsers(where: {}) {
        nodes {
          name
        }
      }
    }`;
        const { data } = yield graphql_1.graphql(schema, query, null);
        expect(data).toMatchSnapshot();
    }));
    it('should be able to delete instances', () => __awaiter(this, void 0, void 0, function* () {
        const schema = builder.build(0);
        const query = `mutation {
      deleteUsers(where: { id: "1" }) {
        name
      }
    }`;
        const { data } = yield graphql_1.graphql(schema, query, null);
        expect(database_1.db).not.toHaveProperty('1');
    }));
    it('should create an account for the user', () => __awaiter(this, void 0, void 0, function* () {
        const schema = builder.build(0);
        const { data: { getUser: { id } } } = yield graphql_1.graphql(schema, `{
      getUser(where: { name: "New Test-User" }) { id }
    }`, null);
        const query = `mutation($id: ID!) {
      createAccount(data: {
        name: "New Account"
        user: { id: $id }
      }) {
        id
        name
        amount
        user {
          name
        }
      }
    }`;
        const { data } = yield graphql_1.graphql(schema, query, null, null, { id });
        expect(data).toHaveProperty('createAccount');
        expect(data.createAccount).toHaveProperty('id');
        const { id: accountId, user } = data.createAccount;
        expect(database_1.db).toHaveProperty(accountId);
        expect(user).toHaveProperty('name');
        expect(user.name).toEqual(database_1.db[id].name);
    }));
    it('should find the new account in the user as well', () => __awaiter(this, void 0, void 0, function* () {
        const schema = builder.build(0);
        const { data, errors } = yield graphql_1.graphql(schema, `{
      getUser(where: { name: "New Test-User" }) {
        name
        accounts {
          name
        }
      }
    }`);
        expect(data).toHaveProperty('getUser');
        expect(data.getUser).toHaveProperty('name');
        expect(data.getUser).toHaveProperty('accounts');
        expect(data.getUser.name).toEqual('New Test-User');
        expect(data.getUser.accounts).toHaveLength(1);
        expect(data.getUser.accounts[0].name).toEqual('New Account');
    }));
});
//# sourceMappingURL=schemaBuilder.spec.js.map
import {
  graphql,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  printSchema,
} from 'graphql'

import { toList } from 'utils'
import { createSchemaBuilder } from './schemaBuilder'
import { ModelBuilder, NodeType, SchemaBuilder } from './types'

import {
  Account,
  Accounts,
  db,
  findMany,
  Nodes,
  Page,
  Paged,
  reset,
  User,
  Users,
} from '__mocks__/database'

describe('schemaBuilder', () => {
  let builder: SchemaBuilder<number>

  beforeEach(() => {
    builder = createSchemaBuilder<number>()
  })

  it('should have basic methods', () => {
    expect(builder).toHaveProperty('model')
    expect(typeof builder.model).toBe('function')
  })

  it('should render an empty Schema', () => {
    expect(printSchema(builder.build(0))).toMatchSnapshot()
  })
})

describe('example', () => {
  let builder: SchemaBuilder<number>

  beforeAll(() => {
    reset()
    builder = createSchemaBuilder<number>()
  })

  it('should add User to the Schema', () => {
    const user = builder.model('User', Users)
    user.attr('name', GraphQLString)
    user.attr('friends', user).isList()
    const schema = builder.build(0)
    expect(printSchema(schema)).toMatchSnapshot()
  })

  it('should add account to the model', () => {
    const account = builder.model('Account', Accounts)

    // will add input types for "STRING"
    account.attr('name', GraphQLString)
    account.attr('amount', GraphQLFloat)
    // will add input types for "REFERENCE"
    account
      .attr('user', builder.models.User)
      .resolve(account =>
        Users.findOne({ where: { id: account.userId }, order: null }),
      )
      .isNotNullable()
    // add accounts to the user model
    builder.models.User.attr('accounts', account)
      .resolve(user => findMany({ userId: user.id }, null))
      .isList()

    expect(printSchema(builder.build(0))).toMatchSnapshot()
  })

  it('should be able read from the schema', async () => {
    const schema = builder.build(0)

    const query = `{
      getUser(where: {
        id: "1",
      }) {
        name
      }
    }`

    const { data } = await graphql(schema, query, null)
    expect(data).toMatchSnapshot()
  })

  it('should be able to create an instance', async () => {
    const schema = builder.build(0)

    const query = `mutation {
      createUser(data: {
        name: "New Test-User",
      }) {
        name
      }
    }`

    const { data, errors } = await graphql(schema, query, null)
    expect(data).toHaveProperty('createUser')
    expect(data.createUser).toHaveProperty('name')
    expect(data.createUser.name).toEqual('New Test-User')
  })

  it('should find multiple things', async () => {
    const schema = builder.build(0)

    // where is required by may be an empty thing
    const query = `{
      getUsers(where: {}) {
        nodes {
          name
        }
      }
    }`

    const { data } = await graphql(schema, query, null)
    expect(data).toMatchSnapshot()
  })

  it('should be able to delete instances', async () => {
    const schema = builder.build(0)

    const query = `mutation {
      deleteUsers(where: { id: "1" }) {
        name
      }
    }`

    const { data } = await graphql(schema, query, null)
    expect(db).not.toHaveProperty('1')
  })

  it('should create an account for the user', async () => {
    const schema = builder.build(0)

    const {
      data: {
        getUser: { id },
      },
    } = await graphql(
      schema,
      `
        {
          getUser(where: { name: "New Test-User" }) {
            id
          }
        }
      `,
      null,
    )

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
    }`

    const { data } = await graphql(schema, query, null, null, { id })
    expect(data).toHaveProperty('createAccount')
    expect(data.createAccount).toHaveProperty('id')
    const { id: accountId, user } = data.createAccount
    expect(db).toHaveProperty(accountId)
    expect(user).toHaveProperty('name')
    expect(user.name).toEqual((db[id] as User).name)
  })

  it('should find the new account in the user as well', async () => {
    const schema = builder.build(0)

    const { data, errors } = await graphql(
      schema,
      `
        {
          getUser(where: { name: "New Test-User" }) {
            name
            accounts {
              name
            }
          }
        }
      `,
    )

    expect(data).toHaveProperty('getUser')
    expect(data.getUser).toHaveProperty('name')
    expect(data.getUser).toHaveProperty('accounts')
    expect(data.getUser.name).toEqual('New Test-User')
    expect(data.getUser.accounts).toHaveLength(1)
    expect(data.getUser.accounts[0].name).toEqual('New Account')
  })
})

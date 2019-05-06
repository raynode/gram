
import { graphql, GraphQLID, GraphQLInt, GraphQLList, GraphQLString, printSchema } from 'graphql'

import { createSchemaBuilder } from 'schemaBuilder'
import { ModelBuilder, SchemaBuilder, Service } from 'types'
import { toList } from 'utils'

import {
  Account,
  Accounts,
  db,
  Nodes,
  NodeType,
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

  const addNodeAttributes = <Type>(node: ModelBuilder<number, Type>) => {
    node.attr('id', GraphQLID)
    node.attr('createdAt', GraphQLString)
    node.attr('updatedAt', GraphQLString)
    node.attr('deletedAt', GraphQLString)
    return node
  }

  const addListAttributes = <ListType, ModelType>(
    list: ModelBuilder<number, ListType>,
    model: ModelBuilder<number, ModelType>,
  ) => {
    list.attr('page', builder.models.Page)
    list.attr('nodes', model).isList()
    return list
  }

  const createListOf = <Type>(name: string, model: ModelBuilder<number, Type>) => {
    if(builder.models[name])
      return builder.models[name]
    const list = addListAttributes(builder.model<Type>(name).interface('List'), model)
    model.listType(list)
    return list
  }

  it('should add User to the Schema', () => {
    const user = builder.model<User>('User', Users)
    user.attr('name', GraphQLString)
    const schema = builder.build(0)
    expect(printSchema(schema)).toMatchSnapshot()
  })

  it('should accept an interface type', () => {
    const node = addNodeAttributes(builder.interface<NodeType>('Node', Nodes))
    const page = builder.model<NodeType>('Page')
    const list = addListAttributes(builder.interface<NodeType>('List'), node)

    page.attr('page', GraphQLInt)
    page.attr('limit', GraphQLInt)
    page.attr('offset', GraphQLInt)

    createListOf('Users', addNodeAttributes(builder.models.User.interface('Node')))

    const schema = builder.build(0)
    expect(printSchema(builder.build(0))).toMatchSnapshot()
  })

  it('should add account to the model', () => {
    const account = addNodeAttributes(builder.model<Account>('Account', Accounts).interface('Node'))
    const accounts = createListOf('Accounts', account)

    // will add input types for "STRING"
    account.attr('name', GraphQLString)
    // will add input types for "REFERENCE"
    account
      .attr('user', builder.models.User)
      .isNotNullable()
    // add accounts to the user model
    builder.models.User
      .attr('accounts', accounts)

    expect(printSchema(builder.build(0))).toMatchSnapshot()
  })

  it('should be able to use the schema', async () => {
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
        name: "New User",
      }) {
        name
      }
    }`

    const { data } = await graphql(schema, query, null)
    expect(data).toHaveProperty('createUser')
    expect(data.createUser).toHaveProperty('name')
    expect(data.createUser.name).toEqual('New User')
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
})

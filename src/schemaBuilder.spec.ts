
import { graphql, GraphQLID, GraphQLInt, GraphQLList, GraphQLString, printSchema } from 'graphql'

import { createSchemaBuilder } from './schemaBuilder'
import { ModelBuilder, SchemaBuilder, Service } from './types'

import { toList } from 'utils'

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

// interfaces
interface NodeType {
  id: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
interface Page {
  limit: number
  offset: number
  page: number
}
interface Paged<Type> {
  page: Page
  nodes: Type[]
}
interface Account extends NodeType {
  id: string
  name: string
  user: User
}
interface User extends NodeType {
  id: string
  name: string
  accounts: string[]
}

describe.only('example', () => {
  // services
  let db: Record<string, NodeType> = {}
  const Nodes: Service<NodeType> = {
    findOne: async () => null,
    findMany: async () => null,
  }
  const Accounts: Service<Account> = {
    create: async () => null,
    findMany: async () => null,
    findOne: async () => null,
    remove: async () => null,
    update: async () => null,
  }
  const Users: Service<User> = {
    create: async () => null,
    findMany: async () => null,
    findOne: async ({ where }) => {
      if(where.id)
        return db[where.id] as User
      console.log(where)
      return null
    },
    remove: async () => null,
    update: async () => null,
  }

  let builder: SchemaBuilder<number>

  beforeAll(() => {
    const user1: User = {
      id: '1',
      name: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      accounts: [],
    }
    db = {
      1: user1,
    }
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
    console.log(printSchema(schema))
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

    console.log(printSchema(schema))
    const { data, errors } = await graphql(schema, query, null)
    if(errors) {
      console.log(errors[0])
      console.log(errors[0].locations)
    }
    console.log(data)
  })
})

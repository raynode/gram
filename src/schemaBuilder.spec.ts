
import { graphql, GraphQLID, GraphQLInt, GraphQLList, GraphQLString, printSchema } from 'graphql'

import { createSchemaBuilder } from './schemaBuilder'
import { ModelBuilder, SchemaBuilder } from './types'

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

interface Account {
  id: string
  name: string
  user: User
}
interface User {
  id: string
  name: string
  accounts: Paged<Account>
}

describe.only('example', () => {
  // services
  let db = {}
  const Accounts = { findAll: () => [] }
  const Users = { find: () => null }

  let builder: SchemaBuilder<number>

  beforeAll(() => {
    db = {}
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

  const hide = <Type>(model: ModelBuilder<number, Type>) => {
    const hidden = {
      createMutation: false,
      deleteMutation: false,
      findManyQuery: false,
      findOneQuery: false,
      updateMutation: false,
    }
    model.context(model => { model.visibility = { ...model.visibility, ...hidden } })
    return model
  }

  const createListOf = <Type>(name: string, model: ModelBuilder<number, Type>) => {
    if(builder.models[name])
      return builder.models[name]
    const list = hide(addListAttributes(builder.model<Type>(name).interface('List'), model))
    model.listType(list)
    return list
  }

  it('should add User to the Schema', () => {
    const user = builder.model<User>('User')
    user.attr('name', GraphQLString)

    expect(printSchema(builder.build(0))).toMatchSnapshot()
  })

  it('should accept an interface type', () => {
    const node = hide(addNodeAttributes(builder.interface<NodeType>('Node')))
    const page = hide(builder.model<NodeType>('Page'))
    const list = hide(addListAttributes(builder.interface<NodeType>('List'), node))

    page.attr('page', GraphQLInt)
    page.attr('limit', GraphQLInt)
    page.attr('offset', GraphQLInt)

    createListOf('Users', addNodeAttributes(builder.models.User.interface('Node')))

    expect(printSchema(builder.build(0))).toMatchSnapshot()
  })

  it('should add account to the model', () => {
    const account = addNodeAttributes(builder.model<Account>('Account').interface('Node'))
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
      getUser {
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

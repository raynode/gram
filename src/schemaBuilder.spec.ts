
import { GraphQLID, GraphQLInt, GraphQLList, GraphQLString, printSchema } from 'graphql'

import { createSchemaBuilder } from './schemaBuilder'
import { ModelBuilder, SchemaBuilder } from './types'

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
interface Account {
  id: string
  name: string
  tags: Tag[]
  swarmId: string
}
interface Tag {
  id: string
  val: string
}
interface User {
  id: string
  name: string
  // touchpoints: Account[]
}

describe.only('example', () => {
  // services
  const Touchpoints = { findAll: () => [] }
  const Tags = { findAll: () => [] }
  const Swarms = { find: () => null }

  let builder: SchemaBuilder<number>

  beforeAll(() => {
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
    return model
  }

  it('should add User to the Schema', () => {
    const user = builder.model<User>('User')
    user.attr('name', GraphQLString)

    console.log(printSchema(builder.build(0)))
    // expect(printSchema(builder.build(0))).toMatchSnapshot()
  })

  it('should accept an interface type', () => {
    const node = hide(addNodeAttributes(builder.model<NodeType>('Node')))
    const page = hide(builder.model<NodeType>('Page'))
    const list = hide(addListAttributes(builder.model<NodeType>('List'), node))

    page.attr('page', GraphQLInt)
    page.attr('limit', GraphQLInt)
    page.attr('offset', GraphQLInt)

    createListOf('Users', addNodeAttributes(builder.models.User.interface('Node')))

    console.log(printSchema(builder.build(0)))
  })

  it.skip('should add account to the model', () => {
    const account = addNodeAttributes(builder.model<Account>('Account'))
    const accounts = createListOf('Accounts', account)

    account.listType(accounts)

    // will add input types for "STRING"
    account.attr('name', GraphQLString)
    // will add input types for "REFERENCE"
    account
      .attr('user', builder.models.User)
      .isNotNullable()

    account.interface('Node')

    builder.models.User
      .attr('accounts', accounts)

    console.log(printSchema(builder.build(0)))
    // expect(printSchema(builder.build(0))).toMatchSnapshot()
  })

})

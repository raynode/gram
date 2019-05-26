import {
  graphql,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLString,
  introspectionQuery,
  printSchema,
} from 'graphql'
import { createSchemaBuilder, NodeType, Service } from '..'

interface User extends NodeType {
  email: string
}

interface UserAction extends NodeType {
  userId: string
}

type SchemaTypes = 'admin' | 'user'

const Users: Service<User> = {
  findMany: async () => ({
    page: { limit: 100, offset: 0 },
    nodes: [],
  }),
  // findOne: async () => null,
  // create: async () => null,
  // remove: async () => null,
  // update: async () => null,
}

describe('testing the example 1', () => {
  it('should build the example code', async () => {
    const builder = createSchemaBuilder<SchemaTypes>()
    const user = builder.model('User', Users)
    user.context((model, { context }) => {
      console.log('checking for context: ', context)
      if (context === 'user') model.visibility.findManyQuery = false
    })

    user.attr('email', GraphQLString)

    builder.addType('context', GraphQLString, ({ context }) => {
      console.log(context)
      return () => context
    })
    interface GQLContext {
      authToken?: string
      authId?: string
    }
    builder.addType(
      'me',
      user,
      ({ context: schemaContext }) => (root, args, context?: GQLContext) => {
        console.log('trying to get ME', context)
        if (!context) throw new Error('Need an authToken-context')
        if (schemaContext === 'user' && !context.authToken)
          throw new Error('Need an user:authToken')
        if (!context.authId) throw new Error('Need an authID')
        return {
          id: context.authId,
          email: schemaContext === 'admin' ? 'admin' : context.authToken,
        }
      },
    )

    const adminSchema = builder.build('admin')
    const userSchema = builder.build('user')
    // console.log(printSchema(adminSchema))
    // console.log(printSchema(userSchema))
    const adminResult = await graphql({
      schema: adminSchema,
      source: `{ context me { email }}`,
      contextValue: {
        authId: 'AdminID',
      },
    })
    const userResult = await graphql({
      schema: userSchema,
      source: `{ context me { email }}`,
      contextValue: {
        authId: 'AuthenticationID',
        authToken: 'My@Token.com',
      },
    })
    console.log(adminResult, userResult)
  })
})

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

describe('testing the example 1', () => {
  it('should build the example code', async () => {
    interface GQLContext {
      authToken?: string
      authId?: string
    }

    const builder = createSchemaBuilder<SchemaTypes>()
    const user = builder.model('User')
    user.attr('email', GraphQLString)

    builder.addQuery('context', GraphQLString, ({ context }) => () => context)

    builder.addQuery(
      'me',
      user,
      ({ context: schemaContext }) => (root, args, context?: GQLContext) => {
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

    const source = `{ context me { email }}`

    const adminResult = await graphql({
      schema: adminSchema,
      source,
      contextValue: {
        authId: 'AdminID',
      },
    })
    const userResult = await graphql({
      schema: userSchema,
      source,
      contextValue: {
        authId: 'AuthenticationID',
        authToken: 'My@Token.com',
      },
    })
    expect(userResult.data).toEqual({
      context: 'user',
      me: { email: 'My@Token.com' },
    })
    expect(adminResult.data).toEqual({
      context: 'admin',
      me: { email: 'admin' },
    })
    expect(printSchema(userSchema)).toMatchSnapshot()
  })
})

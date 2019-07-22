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

    const builder = createSchemaBuilder<SchemaTypes, GQLContext>()
    const user = builder.model('User')
    user.attr('email', GraphQLString)

    builder.addQuery(({ buildMode }) => ({
      name: 'buildMode',
      type: GraphQLString,
      resolver: () => buildMode,
    }))

    builder.addQuery(({ buildMode }) => ({
      name: 'me',
      type: user,
      resolver: (root, args, queryContext) => {
        if (!queryContext) throw new Error('Need an authToken-context')
        if (buildMode === 'user' && !queryContext.authToken)
          throw new Error('Need an user:authToken')
        if (!queryContext.authId) throw new Error('Need an authID')
        return {
          id: queryContext.authId,
          email: buildMode === 'admin' ? 'admin' : queryContext.authToken,
        }
      },
    }))

    const adminSchema = builder.build('admin')
    const userSchema = builder.build('user')

    const source = `{ buildMode me { email }}`

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
    expect(printSchema(adminSchema)).toMatchSnapshot()
    expect(printSchema(userSchema)).toMatchSnapshot()
    expect(adminResult).not.toHaveProperty('errors')
    expect(userResult).not.toHaveProperty('errors')
    expect(userResult.data).toEqual({
      buildMode: 'user',
      me: { email: 'My@Token.com' },
    })
    expect(adminResult.data).toEqual({
      buildMode: 'admin',
      me: { email: 'admin' },
    })
  })
})

import { graphql, GraphQLString } from 'graphql'
import { makeExecutableSchema } from 'graphql-tools'
import { createBuild } from './createBuild'

describe('createBuild', () => {
  it('should create a base object with methods to add everything for gql', () => {
    const build = createBuild()
    expect(build).toMatchSnapshot()
  })

  it('should be able to create a simple graphql interface', async () => {
    const build = createBuild()
    build.addQuery('test', GraphQLString, () => 'TEST')
    const { typeDefs, resolvers } = build.toTypeDefs()
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    })
    const result = await graphql({ schema, source: '{ test }' })
    expect(result).toMatchSnapshot()
  })

  it('should accept a buildMode function', async () => {
    const build = createBuild()
    build.addQuery('test', buildMode => GraphQLString, () => () => 'TEST')
    const { typeDefs, resolvers } = build.toTypeDefs()
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    })
    const result = await graphql({ schema, source: '{ test }' })
    expect(result).toMatchSnapshot()
  })
})

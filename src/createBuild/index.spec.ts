import { graphql, GraphQLNonNull, GraphQLString, printSchema } from 'graphql'
import { makeExecutableSchema } from 'graphql-tools'
import { createBuild } from '.'
import { AddObjectArgsType, AddObjectType } from './method-addType'

const initialPets = [
  {
    name: 'Fluffy',
    kind: 'dog',
    age: 5,
    owner: 'Mark',
  },
]

const data = {
  pets: initialPets,
}

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

  it('should generate the schema directly', async () => {
    const build = createBuild()
    build.addQuery('test', GraphQLString, () => 'TEST')
    const result = await graphql({
      schema: build.toSchema(),
      source: '{ test }',
    })
    expect(result).toMatchSnapshot()
  })

  it('should accept a buildMode function', async () => {
    const build = createBuild()
    build.addQuery('test', buildMode => GraphQLString, {
      resolver: () => () => 'TEST',
    })
    const { typeDefs, resolvers } = build.toTypeDefs()
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    })
    const result = await graphql({ schema, source: '{ test }' })
    expect(result).toMatchSnapshot()
  })

  it('should be able to accept a new scalar type', async () => {
    const build = createBuild()
    build.addType('MyScalar', 'scalar')
    build.addQuery('myScalar', 'MyScalar', () => 'TEST')
    const result = await graphql({
      schema: build.toSchema(),
      source: '{ myScalar }',
    })
    expect(result).toMatchSnapshot()
  })

  it('should be able to accept a new object type', async () => {
    const build = createBuild()
    build.addType('Pet', 'type', {
      fields: {
        name: GraphQLString,
        age: 'Int!',
      },
    })
    build.addQuery('myPets', '[Pet!]!', () => data.pets)
    const result = await graphql({
      schema: build.toSchema(),
      source: '{ myPets { name age } }',
    })
    expect(result).toMatchSnapshot()
  })

  it('should have types that are different based on buildMode', async () => {
    type BuildMode = 'admin' | 'user'
    const adminBuild = createBuild<BuildMode>('admin')
    const userBuild = createBuild<BuildMode>('user')

    const petFields = (buildMode: BuildMode) => ({
      name: GraphQLString,
      age: 'Int!',
      ...(buildMode === 'admin' && {
        owner: GraphQLNonNull(GraphQLString),
      }),
    })

    adminBuild.addType('Pet', 'type', { fields: petFields })
    userBuild.addType('Pet', 'type', { fields: petFields })
    adminBuild.addQuery('myPets', '[Pet!]!', () => data.pets)
    userBuild.addQuery('myPets', '[Pet!]!', () => data.pets)
    expect(adminBuild.toTypeDefs().typeDefs).toMatchSnapshot()
    expect(userBuild.toTypeDefs().typeDefs).toMatchSnapshot()
  })

  it('should accept build mode generators on type level', async () => {
    type BuildMode = 'admin' | 'user'
    const adminBuild = createBuild<BuildMode>('admin')
    const userBuild = createBuild<BuildMode>('user')

    const Pet = (buildMode: BuildMode): AddObjectArgsType<BuildMode> => [
      'Pet',
      'type',
      {
        fields: {
          name: GraphQLString,
          age: 'Int!',
          ...(buildMode === 'admin' && {
            owner: GraphQLNonNull(GraphQLString),
          }),
        },
      },
    ]

    adminBuild.addType(Pet)
    userBuild.addType(Pet)
    adminBuild.addQuery('myPets', '[Pet!]!', () => data.pets)
    userBuild.addQuery('myPets', '[Pet!]!', () => data.pets)
    expect(adminBuild.toTypeDefs().typeDefs).toMatchSnapshot()
    expect(userBuild.toTypeDefs().typeDefs).toMatchSnapshot()
  })
})

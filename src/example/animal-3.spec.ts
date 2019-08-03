import { GraphQLBoolean, GraphQLInt, GraphQLString, printSchema } from 'graphql'
import { createSchemaBuilder, ListType, NodeType, Service } from '..'

interface Animal extends NodeType {
  name: string
  mother: Animal
  father: Animal
  children: Animal[]
}

const Animals: Service<Animal> = {
  findOne: async () => null,
  findMany: async () => ({
    page: null,
    nodes: [],
  }),
}

const AnimalService: Service<Animal> = {
  findOne: async ({ order, where }, context) =>
    Animals.findOne({ order, where }, context) as Promise<Animal>,
  findMany: async ({ order, page, where }, context) =>
    Animals.findMany({ order, page, where }, context) as Promise<
      ListType<Animal>
    >,
}

describe('testing the example 3', () => {
  it('should build the example code', () => {
    const builder = createSchemaBuilder()
    const animal = builder.model('Animal', AnimalService)
    // animal name like 'Fluffy', 'Rex'
    // field is required
    animal.attr('name', 'String!')
    // parents
    animal.attr('mother', 'Animal')
    animal.attr('father', 'Animal')
    // children
    animal.attr('children', '[Animal!]!')

    const schema = builder.build()

    expect(printSchema(schema)).toMatchSnapshot()
  })
})

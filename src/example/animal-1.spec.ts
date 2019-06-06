import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  printSchema,
} from 'graphql'
import { createSchemaBuilder, Service } from '..'

interface Animal {
  type: string
  name: string
  tame: boolean
  age: number
}

const Animals: Service<Animal> = {
  findMany: async () => ({
    page: { limit: 100, offset: 0 },
    nodes: [],
  }),
  findOne: async () => null,
  create: async () => null,
  remove: async () => null,
  update: async () => null,
}

describe('testing the example 1', () => {
  it('should build the example code', () => {
    const builder = createSchemaBuilder()
    const animal = builder.model('Animal', Animals)
    // animal type like 'dog', 'cat'
    // field is required
    animal.attr('type', GraphQLString).isNotNullable()
    // animal name like 'Fluffy', 'Rex'
    // field is not required
    animal.attr('name', GraphQLString)
    // is it a tame animal
    animal.attr('tame', GraphQLBoolean)
    // age of the animal
    animal.attr('age', GraphQLInt)

    expect(printSchema(builder.build())).toMatchSnapshot()
  })
})

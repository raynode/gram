import {
  graphql,
  GraphQLBoolean,
  GraphQLInt,
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

interface DatabaseAnimal {
  type: string
  name: string
  tame: boolean
  birthdate: number
}

let animals: any[] = []

const Animals: Service<Animal, DatabaseAnimal> = {
  findMany: async () => ({
    page: { limit: 100, offset: 0 },
    nodes: animals,
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

    animal.resolve(() => ({
      age: animal =>
        Math.floor((Date.now() - animal.birthdate) / 1000 / 60 / 60 / 24 / 365),
    }))

    expect(printSchema(builder.build())).toMatchSnapshot()
  })

  it('should use the resolver when queried', async () => {
    // initialize the database
    const birthdate = new Date()
    // create random age
    const age = Math.floor(Math.random() * 5 + 5)
    // change the year to be that amount of years back
    birthdate.setUTCFullYear(birthdate.getUTCFullYear() - age)
    animals = [
      {
        type: 'cat',
        name: 'Fluffy',
        tame: true,
        birthdate: +birthdate, // convert to number
      },
    ]
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

    let called = false
    animal.resolve(() => ({
      age: animal => {
        called = true
        return Math.floor(
          (Date.now() - animal.birthdate) / 1000 / 60 / 60 / 24 / 365,
        )
      },
    }))

    const { resolvers } = builder.createBuild().toTypeDefs()
    const schema = builder.build()

    const { data, errors } = await graphql({
      schema,
      source: `{
        getAnimals(where: {}) {
          nodes {
            type
            name
            tame
            age
          }
        }
      }`,
    })
    // expect the age to be calculated
    expect(data.getAnimals.nodes[0].age).toEqual(age)
    // make sure the default resolvers are still active
    expect(data.getAnimals.nodes[0].name).toEqual('Fluffy')
    // expect the function to have been called
    expect(called).toBeTruthy()
  })
})

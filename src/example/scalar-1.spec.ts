import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLScalarType,
  GraphQLString,
  printSchema,
} from 'graphql'
import {
  createSchemaBuilder,
  filters,
  isSpecificScalarType,
  Service,
} from '..'

enum AnimalTypes {
  Cat,
  Dog,
}

interface Animal {
  type: AnimalTypes
  name: string
  tame: boolean
  age: number
}

const Animals: Service<Animal> = {
  findOne: async () => null,
  findMany: async () => ({
    page: null,
    nodes: [],
  }),
}

const EatingType = new GraphQLScalarType({
  name: 'EatingType',
  description: 'What is this animal eating',
  serialize: val => val,
})

describe('testing the example 3', () => {
  it('should build the example code', () => {
    const builder = createSchemaBuilder()
    builder.setScalar('EatingType', EatingType)

    const animal = builder.model('Animal', Animals)

    const DateTime = builder.getScalar('DateTime')
    // animal name like 'Fluffy', 'Rex'
    // field is not required
    animal.attr('name', GraphQLString)
    // is it a tame animal
    animal.attr('tame', GraphQLBoolean)
    // age of the animal
    animal.attr('dateOfBirth', DateTime)
    // feeding type of the animal
    animal.attr('feed', EatingType)

    expect(printSchema(builder.build())).toMatchSnapshot()
  })

  it('should handle new filters', () => {
    const builder = createSchemaBuilder()
    builder.setScalar('EatingType', EatingType)

    const checkFn = isSpecificScalarType('EatingType')
    const filterFn = filters.joinFilters([
      filters.equals, // adds equal & not-equal filter
      filters.record, // adds in && not-in filters
    ])
    builder.addFilter(checkFn, filterFn)

    const animal = builder.model('Animal', Animals)

    const DateTime = builder.getScalar('DateTime')
    // animal name like 'Fluffy', 'Rex'
    // field is not required
    animal.attr('name', GraphQLString)
    // is it a tame animal
    animal.attr('tame', GraphQLBoolean)
    // age of the animal
    animal.attr('dateOfBirth', DateTime)
    // feeding type of the animal
    animal.attr('feed', EatingType)

    expect(printSchema(builder.build())).toMatchSnapshot()
  })
})

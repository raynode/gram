import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLString,
  printSchema,
} from 'graphql'
import { createSchemaBuilder, Service } from '..'

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

interface Cat extends Animal {
  type: AnimalTypes.Cat
}
interface Dog extends Animal {
  type: AnimalTypes.Dog
}

const Animals: Service<Animal> = {
  findOne: async () => null,
}

const Cats: Service<Cat> = {
  findOne: async ({ order, where }) =>
    Animals.findOne({
      order,
      where: { ...where, type: AnimalTypes.Cat },
    }) as Promise<Cat>,
}
const Dogs: Service<Dog> = {
  findOne: async ({ order, where }) =>
    Animals.findOne({
      order,
      where: { ...where, type: AnimalTypes.Dog },
    }) as Promise<Dog>,
}

describe('testing the example 2', () => {
  it('should build the example code', () => {
    const builder = createSchemaBuilder()
    const animal = builder.interface('Animal')
    // animal name like 'Fluffy', 'Rex'
    // field is not required
    animal.attr('name', GraphQLString)
    // is it a tame animal
    animal.attr('tame', GraphQLBoolean)
    // age of the animal
    animal.attr('age', GraphQLInt)

    const cat = builder.model('Cat', Animals)
    cat.interface('Animal')

    expect(printSchema(builder.build())).toMatchSnapshot()
  })

  it('should build the second part of the example', () => {
    const builder = createSchemaBuilder()
    const animal = builder.interface('Animal', Animals)
    animal.attr('name', GraphQLString)
    animal.attr('tame', GraphQLBoolean)
    animal.attr('age', GraphQLInt)

    const cat = builder.model('Cat', Cats)
    cat.interface('Animal')
    const dog = builder.model('Dog', Dogs)
    dog.interface('Animal')

    expect(printSchema(builder.build())).toMatchSnapshot()
  })
})

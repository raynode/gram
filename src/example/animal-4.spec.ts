import { graphql, printSchema } from 'graphql'
import { createSchemaBuilder, ListType, NodeType, Service } from '..'

enum AnimalTypes {
  Cat,
  Dog,
}

interface Animal extends NodeType {
  type: AnimalTypes
  name: string
}

interface Cat extends Animal {
  type: AnimalTypes.Cat
}
interface Dog extends Animal {
  type: AnimalTypes.Dog
}

interface Type {
  __typename: string
  isTypeOf: (...x: any[]) => any
}

let id = 0
const toAnimal = (animal: Omit<Animal, keyof NodeType>): Animal => ({
  id: `id-${id++}`,
  created_at: new Date(),
  deleted_at: null,
  updated_at: new Date(),
  ...animal,
})

const addTypeName = (animal: Animal) => ({
  ...animal,
  __typename: animal.type === AnimalTypes.Cat ? 'Cat' : 'Dog',
})

const animals = [
  { type: AnimalTypes.Cat, name: 'Tiger', meow: 'RROOOOOOOOAAAARRRR!' },
  { type: AnimalTypes.Dog, name: 'Rover', bark: 'Wuff Wuff!' },
].map(toAnimal)

const Animals: Service<Animal> = {
  findOne: async () => null,
  findMany: async () => ({
    page: null,
    nodes: animals.map(addTypeName),
  }),
}

const AnimalsWithoutTypename: Service<Animal> = {
  findOne: async () => null,
  findMany: async () => ({
    page: null,
    nodes: animals,
  }),
}

const createAnimalService = <Type extends Animal>(
  type: AnimalTypes,
): Service<Type> => ({
  findOne: async ({ order, where }, context) =>
    Animals.findOne(
      {
        order,
        where: { ...where, type },
      },
      context,
    ) as Promise<Type>,
  findMany: async ({ order, page, where }, context) =>
    Animals.findMany(
      {
        order,
        page,
        where: { ...where, type },
      },
      context,
    ) as Promise<ListType<Type>>,
})

const Cats = createAnimalService<Cat>(AnimalTypes.Cat)
const Dogs = createAnimalService<Dog>(AnimalTypes.Dog)

const source = `{
  getAnimals(where: {}) {
    nodes {
      ... on Animal {
        name
        ... on Cat { meow }
        ... on Dog { bark }
      }
    }
  }
}`

it('should correctly identify the type when typename is given', async () => {
  const builder = createSchemaBuilder()
  const animal = builder.interface('Animal', Animals)
  animal.attr('name', 'String!')

  const cat = builder.model('Cat', Cats)

  cat.attr('meow', 'String!')
  cat.interface('Animal')

  const dog = builder.model('Dog', Dogs)
  dog.interface('Animal')
  dog.attr('bark', 'String!')

  const schema = builder.build()

  // console.log(printSchema(schema))
  const { data, errors } = await graphql({ schema, source })
  expect(errors).toBeFalsy()
  expect(data).toEqual({
    getAnimals: {
      nodes: [
        { name: 'Tiger', meow: 'RROOOOOOOOAAAARRRR!' },
        { name: 'Rover', bark: 'Wuff Wuff!' },
      ],
    },
  })
})

it('should use the resolver to identify the type of animal', async () => {
  const builder = createSchemaBuilder()
  const animal = builder.interface('Animal', AnimalsWithoutTypename)
  animal.attr('name', 'String!')

  const cat = builder.model('Cat', Cats)

  cat.attr('meow', 'String!')
  cat.interface('Animal')

  const dog = builder.model('Dog', Dogs)
  dog.interface('Animal')
  dog.attr('bark', 'String!')

  // direct version
  cat.resolve(() => ({
    __isTypeOf: cat => cat.type === AnimalTypes.Cat,
  }))

  // with builder function
  const isTypeOf = (type: AnimalTypes) => (animal: Animal) =>
    animal.type === type
  dog.resolve(() => ({
    __isTypeOf: isTypeOf(AnimalTypes.Dog),
  }))

  const schema = builder.build()

  const { data, errors } = await graphql({ schema, source })
  expect(errors).toBeFalsy()
  expect(data).toEqual({
    getAnimals: {
      nodes: [
        { name: 'Tiger', meow: 'RROOOOOOOOAAAARRRR!' },
        { name: 'Rover', bark: 'Wuff Wuff!' },
      ],
    },
  })
})

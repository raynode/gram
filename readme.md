[![Node.js version](https://img.shields.io/badge/node->=%208.2.1-blue.svg)](https://nodejs.org/dist/latest-v8.x/docs/api/)
[![NPM version](https://img.shields.io/badge/npm->=%205.4.0-blue.svg)](https://docs.npmjs.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![build with travis-ci](https://travis-ci.org/raynode/gram.svg?branch=master)](https://travis-ci.org/raynode/gram)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://facebook.github.io/jest/)
[![Coverage Status](https://coveralls.io/repos/github/raynode/gram/badge.svg?branch=master)](https://coveralls.io/github/raynode/gram?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/7d6705c7f83a8899fde8/maintainability)](https://codeclimate.com/github/raynode/gram/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/7d6705c7f83a8899fde8/test_coverage)](https://codeclimate.com/github/raynode/gram/test_coverage)

# GRAM

GRAphQL Model builder is a utility to generate all necessary GraphQL query, mutation and subscription Types. It enforces a specific structure for your schema.

## Installation
```bash
npm i gram
```

## Features

* Automatic Interface generation
* Strict schema layout
* Easy adding of resolvers for attribute fields
* Connect a service and go
* Context dependent builds

## Usage

Basic usage would let you generate a model by just defining it and adding some attributes. It requires you to have some service that provides necessary CRUD-style getter and setter functions (`findMany`, `findOne`, `update`, `create`, `remove`).

If you have a service called `Animals` you could create a schema like this:
```typescript
  import { GraphQLString, GraphQLInt, GraphQLBoolean } from 'graphql'
  import { createSchemaBuilder } from 'gram'
  import { Animals } from './my-services/animals'

  const builder = createSchemaBuilder()
  const animal = builder.model('Animal', Animals)

  // animal type like 'dog', 'cat'
  // field is required
  animal.attr('type', GraphQLString).isNonNull()
  // animal name like 'Fluffy', 'Rex'
  // field is not required
  animal.attr('name', GraphQLString)
  // is it a tame animal
  animal.attr('tame', GraphQLBoolean)
  // age of the animal
  animal.attr('age', GraphQLInt)

  const schema = builder.build()
```

This will generate a graphql schema like:
```GraphQL
  type Animal implements Node {
    id: ID
    createdAt: String
    updatedAt: String
    deletedAt: String
    type: String!
    name: String
    tame: Boolean
    age: Int
  }

  input AnimalFilter { … }

  input AnimalPage {
    limit: Int
    offset: Int
  }

  type Animals implements List {
    page: Page
    nodes: [Animal!]!
  }

  enum AnimalSortOrder { … }

  input AnimalWhere { … }

  input CreateAnimalData { … }

  interface List {
    page: Page
    nodes: [Node!]!
  }

  type Mutation {
    createAnimal(data: CreateAnimalData!): Animal
    updateAnimal(data: UpdateAnimalData!, where: AnimalWhere!): [Animal!]!
    deleteAnimals(where: AnimalWhere!): [Animal!]!
  }

  interface Node {
    id: ID
    createdAt: String
    updatedAt: String
    deletedAt: String
  }

  type Page {
    page: Int
    limit: Int
    offset: Int
  }

  type Query {
    getAnimal(where: AnimalWhere!, order: AnimalSortOrder): Animal
    getAnimals(order: AnimalSortOrder, page: AnimalPage, where: AnimalWhere!): Animals
  }

  type Subscription {
    onCreateAnimal: Animal!
    onUpdateAnimal: [Animal!]!
    onDeleteAnimals: [Animal!]!
  }

  input UpdateAnimalData { … }
```

As you can see, some types and interfaces were added.
Gram is a little opinionated about `Node`, `Page` and `List`.
It will generate the `Node` and `List` interfaces and apply them to you models by itself.
Your models will have to implement the `Node` interface and the return value of the `findMany` method will have to return a `Page` type as the `getAnimals` query returns `Animals` which is of interface `List`.

Gram will automatically assume all implemented methods on the service will work.
If you, for example, do not have a findMany method, Gram will remove the `getAnimals` method and just generate the rest.

If you want to generate more than one schema from your models, there will be a feature implemented in the near future to enable and disable parts depending on the context given in the build method.

### Interfaces

Of course our `Animal` model is just an interface to help us build `Cat` and `Dog` models.
We will convert our Animal into an interface and generate a `Cat` model that implements the interface.
There will be no use for that `type` attribute any more, we will just skip it.

```typescript
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
```

```GraphQL
  interface Animal {
    name: String
    tame: Boolean
  }

  type Cat implements Node & Animal {
    id: ID
    createdAt: Date
    updatedAt: Date
    deletedAt: Date
    name: String
    tame: Boolean
  }

  type Query {
    getCat(where: CatWhere!, order: CatSortOrder): Cat
    getCats(order: CatSortOrder, page: CatPage, where: CatWhere!): Cats
  }
```

As you can see it now added the attributes to the `Cat` model and we can now easily add more animal-type models to our system.
We moved the service to the `Cat` model, which is not quite right.
It would be best to have a `Cat` specific service, which will use the `Animal` service in turn, by adding some filters.
But we will want to fetch any `Animals` as well.

```typescript

  interface Animal {
    type: AnimalTypes
    name: string
    tame: boolean
    age: number
  }

  interface Cat extends Animal {
    type: AnimalTypes.Cat,
  }
  interface Dog extends Animal {
    type: AnimalTypes.Dog,
  }

  const Animals: Service<Animal> = {
    findOne: async ({ order, where }) => Magically.findData(where, order),
  }

  const Cats: Service<Cat> = {
    findOne: async ({ order, where }) => Animals.findOne({
      order, where: { ...where, type: AnimalTypes.Cat },
    }) as Promise<Cat>,
  }
  const Dogs: Service<Dog> = {
    findOne: async ({ order, where }) => Animals.findOne({
      order, where: { ...where, type: AnimalTypes.Dog },
    }) as Promise<Dog>,
  }

  // after defining all interfaces we setup the schema

  const builder = createSchemaBuilder()
  const animal = builder.interface('Animal', Animals)
  animal.attr('name', GraphQLString)
  animal.attr('tame', GraphQLBoolean)
  animal.attr('age', GraphQLInt)

  const cat = builder.model('Cat', Cats)
  cat.interface('Animal')
  const dog = builder.model('Dog', Dogs)
  dog.interface('Animal')
```

```GraphQL

  interface Animal {
    name: String
    tame: Boolean
    age: Int
  }

  type Cat implements Node & Animal {
    id: ID
    createdAt: Date
    updatedAt: Date
    deletedAt: Date
    name: String
    tame: Boolean
    age: Int
  }

  type Dog implements Node & Animal {
    id: ID
    createdAt: Date
    updatedAt: Date
    deletedAt: Date
    name: String
    tame: Boolean
    age: Int
  }

  type Query {
    getAnimal(where: AnimalWhere!, order: AnimalSortOrder): Animal
    getCat(where: CatWhere!, order: CatSortOrder): Cat
    getDog(where: DogWhere!, order: DogSortOrder): Dog
  }
```

Now we can find any animal with a `getAnimal(where: { name: "Fluffy" }) { ... on Dog { … }}` or find our Dog directly `getDog(where: { name: "Fluffy" }) { … }`.

### Scalars



## Contributing

If you want to help with this project, just leave a bug report or pull request.
I'll try to come back to you as soon as possible

## License

MIT

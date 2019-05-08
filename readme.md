
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

input AnimalFilter { ... }

input AnimalPage {
  limit: Int
  offset: Int
}

type Animals implements List {
  page: Page
  nodes: [Animal!]!
}

enum AnimalSortOrder { ... }

input AnimalWhere { ... }

input CreateAnimalData { ... }

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

input UpdateAnimalData { ... }
```

As you can see, some types and interfaces were added.
Gram is a little opinionated about `Node`, `Page` and `List`.
It will generate the `Node` and `List` interfaces and apply them to you models by itself.
Your models will have to implement the `Node` interface and the return value of the `findMany` method will have to return a `Page` type as the `getAnimals` query returns `Animals` which is of interface `List`.

Gram will automatically assume all implemented methods on the service will work.
If you, for example, do not have a findMany method, Gram will remove the `getAnimals` method and just generate the rest.

If you want to generate more than one schema from your models, there will be a feature implemented in the near future to enable and disable parts depending on the context given in the build method.

## Contributing

If you want to help with this project, just leave a bug report or pull request.
I'll try to come back to you as soon as possible

## License

MIT

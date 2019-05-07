import { reduce } from 'lodash'
import { NodeType, Service } from 'types'
import { v4 as uuid } from 'uuid'

import { createPageType } from 'index'

// interfaces

export interface Page {
  limit: number
  offset: number
  page: number
}
export interface Paged<Type> {
  page: Page
  nodes: Type[]
}
export interface Account extends NodeType {
  id: string
  name: string
  amount: number
  userId: string
}
export interface User extends NodeType {
  id: string
  name: string
  // id list of Account
  accounts: string[]
  // id list of User
  friends: string[]
}

// services
export let db: Record<string, NodeType> = {}
const createNode = <Type extends NodeType>(data: any): Type => {
  data.id = uuid()
  db[data.id] = data
  return data
}
const deleteNodes = <Type extends NodeType>(where: any): Type[] => {
  const nodes = findMany<Type>(where, null)
  nodes.forEach(node => delete db[node.id])
  return nodes
}
const appliesToWhere = <Type extends NodeType>(node: Type, where: any) => {
  if(!where)
    return true
  return Object.keys(where).reduce((valid, key) => valid && where[key] === node[key], true)
}
export const findMany = <Type>(where: any, order: any): Type[] => reduce(db, (many, entry, key) => {
  if(appliesToWhere(entry, where))
    many.push(entry)
  return many
}, [])
const findOne = <Type>(where: any, order: any) => findMany<Type>(where, order)[0]

const pagedFindMany = <Type>(where: any, order: any) => createPageType<Type>(order, findMany(where, order))

export const Nodes: Service<NodeType> = {
  findOne: async ({ where, order }) => findOne(where, order),
  findMany: async ({ where, order }) => pagedFindMany<NodeType>(where, order),
}
export const Accounts: Service<Account> = {
  create: async ({ data }) => {
    const account = {
      name: data.name,
      userId: data.user.id,
    }
    return createNode<Account>(account)
  },
  findMany: async ({ where, order }) => pagedFindMany<Account>(where, order),
  findOne: async ({ where, order }) => findOne(where, order),
  remove: async ({ where }) => deleteNodes<Account>(where),
  update: async () => null,
}
export const Users: Service<User> = {
  create: async ({ data }) => createNode<User>(data),
  findMany: async ({ where, order }) => pagedFindMany<User>(where, order),
  findOne: async ({ where, order }) => findOne(where, order),
  remove: async ({ where }) => deleteNodes<User>(where),
  update: async () => null,
}

export const reset = () => {
  const user1: User = {
    id: '1',
    name: 'test',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    accounts: [],
    friends: [],
  }

  db = {
    1: user1,
  }
}

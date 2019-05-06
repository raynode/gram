import { Service } from 'types'
import { v4 as uuid } from 'uuid'
import { reduce } from 'lodash'

// interfaces
export interface NodeType {
  id: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
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
  user: User
}
export interface User extends NodeType {
  id: string
  name: string
  accounts: string[]
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
  if(where.id)
    return node.id === where.id
  return false
}
const findMany = <Type>(where: any, order: any): Type[] => reduce(db, (many, entry, key) => {
  if(appliesToWhere(entry, where))
    many.push(entry)
  return many
}, [])
const findOne = <Type>(where: any, order: any) => findMany<Type>(where, order)[0]

export const Nodes: Service<NodeType> = {
  findOne: async ({ where, order }) => findOne(where, order),
  findMany: async ({ where, order }) => findMany(where, order),
}
export const Accounts: Service<Account> = {
  create: async ({ data }) => createNode<Account>(data),
  findMany: async ({ where, order }) => findMany(where, order),
  findOne: async ({ where, order }) => findOne(where, order),
  remove: async ({ where }) => deleteNodes<Account>(where),
  update: async () => null,
}
export const Users: Service<User> = {
  create: async ({ data }) => createNode<User>(data),
  findMany: async ({ where, order }) => findMany(where, order),
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
  }

  db = {
    1: user1,
  }
}

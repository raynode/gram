
export type Where = any
export type Order = any
export type Page = any
export type Data = any

export interface FindOneArgs {
  where: Where
  order: Order
}

export interface FindOneMany {
  where: Where
  order: Order
  page: Page
}

export interface CreateArgs {
  data: Data
}

export interface UpdateArgs {
  where: Where
  data: Data
}

export interface RemoveArgs {
  where: Where
}

export interface Service<Type> {
  findOne?: (args: FindOneArgs) => Promise<Type>
  findMany?: (args: FindOneMany) => Promise<Type[]>
  create?: (args: CreateArgs) => Promise<Type>
  update?: (args: UpdateArgs) => Promise<Type>
  remove?: (args: RemoveArgs) => Promise<Type[]>
}

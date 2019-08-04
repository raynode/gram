export type AnyPartial<Type> = { [Key in keyof Type]?: Type[Key] }

export type Filter<Type> = {
  AND?: Array<Filter<Type>>
  OR?: Array<Filter<Type>>
  NOT?: Filter<Type>,
} & AnyPartial<Type> &
  Record<string, any>

export type Where<Type> = Partial<Filter<Type>>
export type Order = any
export type Page = any
export type Data<Type> = Partial<Type>

export interface NodeType {
  id: string
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

export interface ListType<Type extends NodeType> {
  page: PageData
  nodes: Type[]
}

export interface PageData {
  offset: number
  limit: number
}

export interface FindOneArgs<Type> {
  where: Where<Type>
  order: Order
}

export interface FindOneMany<Type> {
  where: Where<Type>
  order: Order
  page: Page
}

export interface CreateArgs<Type> {
  data: Data<Type>
}

export interface UpdateArgs<Type> {
  where: Where<Type>
  data: Partial<Data<Type>>
}

export interface RemoveArgs<Type> {
  where: Where<Type>
}

export interface Service<Type extends NodeType, GQLType = Type, Context = any> {
  findOne?: (args: FindOneArgs<GQLType>, context: Context) => Promise<Type>
  findMany?: (
    args: FindOneMany<GQLType>,
    context: Context,
  ) => Promise<ListType<Type>>
  create?: (args: CreateArgs<GQLType>, context: Context) => Promise<Type>
  update?: (args: UpdateArgs<GQLType>, context: Context) => Promise<Type[]>
  remove?: (args: RemoveArgs<GQLType>, context: Context) => Promise<Type[]>
}

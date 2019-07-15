import { GraphQLType } from 'graphql'
import {
  IFieldResolver,
  IResolvers,
  ITypeDefinitions,
  makeExecutableSchema,
} from 'graphql-tools'
import { isEmpty, map, reduce } from 'lodash'

type GQLRecord = Record<string, string>
type Resolver<Source, Context> = IFieldResolver<Source, Context>
type Resolvers = IResolvers
type BuildModeGenerator<BuildMode, Result> = (buildMode?: BuildMode) => Result
type BuildModeArgsGenerator<BuildMode, Args, Result = void> = (
  buildModeGenerator: BuildModeGenerator<BuildMode, Args>,
) => Result
type FieldType = string | GraphQLType
type Fields = Record<string, FieldType>

type Resolvables = 'Query' | 'Mutation' | 'Subscription'
interface CreateableTypesRecord {
  scalar: string[]
  type: Record<string, GQLRecord>
  interface: Record<string, GQLRecord>
  input: Record<string, GQLRecord>
}
type CreateableTypes = keyof CreateableTypesRecord

const isBuildModeGenerator = <BuildMode, Result>(
  val: any,
): val is BuildModeGenerator<BuildMode, Result> => typeof val === 'function'

export const typeToString = <Type>(type: Type) => type.toString()

const buildData = (data: GQLRecord) =>
  reduce(
    data,
    (list, type, name) => {
      list.push(`${name}: ${type}`)
      return list
    },
    [],
  ).join('\n')

const generateData = (typeName: Resolvables, data: GQLRecord) => `
  type ${typeName} {
    ${buildData(data)}
  }
`

const generateNonEmpty = (typeName: Resolvables, data: GQLRecord) =>
  isEmpty(data) ? '' : generateData(typeName, data)

const generateCreateableType = (
  createable: CreateableTypes,
  typeName: string,
  fields: GQLRecord,
) => `
  ${createable} ${typeName} {
    ${buildData(fields)}
  }
`

const generateCreateables = (
  createable: CreateableTypes,
  createables: Record<string, GQLRecord>,
) =>
  reduce(
    createables,
    (result, fields, typeName) => {
      result.push(generateCreateableType(createable, typeName, fields))
      return result
    },
    [],
  ).join('\n')

const createBuildModeResolver = <BuildMode>(buildMode: BuildMode) => <Result>(
  data: Result | BuildModeGenerator<BuildMode, Result>,
) => (isBuildModeGenerator<BuildMode, Result>(data) ? data(buildMode) : data)

type AddResolvable = (<Source, Context, Type = FieldType>(
  name: string,
  type: Type,
  resolver?: Resolver<Source, Context>,
) => void) &
  (<BuildMode, Source, Context, Type = FieldType>(
    name: string,
    type: BuildModeGenerator<BuildMode, Type>,
    resolver?: BuildModeGenerator<BuildMode, Resolver<Source, Context>>,
  ) => void)

type AddResolver<Context> = <Source>(
  base: string,
  name: string,
  resolver: Resolver<Source, Context>,
) => void

const resolvablesCreator = <BuildMode, Context>(
  buildMode: BuildMode,
  resolvables: Record<Resolvables, GQLRecord>,
  addResolver: AddResolver<Context>,
) => {
  const resolveBuildModeGenerator = createBuildModeResolver(buildMode)
  return (typeName: Resolvables): AddResolvable => (name, type, resolver) => {
    if (isBuildModeGenerator<BuildMode, FieldType>(type)) {
      resolvables[typeName][name] = typeToString(
        resolveBuildModeGenerator(type),
      )
      addResolver(
        typeName,
        name,
        resolveBuildModeGenerator<Resolver<any, any>>(resolver),
      )
    } else {
      resolvables[typeName][name] = typeToString(type)
      addResolver(typeName, name, resolver)
    }
  }
}

export const generateTypeDefs = (
  resolvables: Record<Resolvables, GQLRecord>,
  types: CreateableTypesRecord,
): ITypeDefinitions => {
  if (isEmpty(resolvables.Query)) throw new Error('Query cannot be empty')

  return `
    ${generateCreateables('interface', types.interface)}
    ${generateCreateables('input', types.input)}
    ${generateCreateables('type', types.type)}
    ${generateData('Query', resolvables.Query)}
    ${generateNonEmpty('Mutation', resolvables.Mutation)}
    ${generateNonEmpty('Subscription', resolvables.Subscription)}
    ${types.scalar.map(name => `scalar ${name}`).join('\n')}
  `
}

export type AddScalarTypeArgs = [string, 'scalar', never]
export type AddNonScalarTypeArgs = [
  string,
  Exclude<CreateableTypes, 'scalar'>,
  Fields
]
export type ScalarOrNonScalarTypeArgs =
  | [string, 'scalar', Fields]
  | [string, Exclude<CreateableTypes, 'scalar'>, never]

export const createBuild = <BuildMode = null, Context = any>(
  buildMode?: BuildMode,
) => {
  type BMGenerator<Result> = BuildModeGenerator<BuildMode, Result>

  const resolveBuildModeGenerator = <Result>(
    data: Result | BMGenerator<Result>,
  ) => (isBuildModeGenerator<BuildMode, Result>(data) ? data(buildMode) : data)

  const resolvables: Record<Resolvables, GQLRecord> = {
    Mutation: {},
    Query: {},
    Subscription: {},
  }
  const types: CreateableTypesRecord = {
    input: {},
    interface: {},
    scalar: [],
    type: {},
  }
  const resolvers: Resolvers = {}
  const addResolver = <Source>(
    base: string,
    name: string,
    resolver: Resolver<Source, Context>,
  ) => {
    resolvers[base] = resolvers[base] || {}
    resolvers[base][name] = resolver
  }

  type AddScalarType = (
    typeName: string,
    type: 'scalar',
    fields?: never,
  ) => void
  type AddNonScalarType = ((
    typeName: string,
    type: Exclude<CreateableTypes, 'scalar'>,
    fields: Fields,
  ) => void) &
    ((
      typeName: string,
      type: Exclude<CreateableTypes, 'scalar'>,
      fields: BMGenerator<Fields>,
    ) => void)

  const createResolvable = resolvablesCreator<BuildMode, Context>(
    buildMode,
    resolvables,
    addResolver,
  )

  const addScalarType: AddScalarType = typeName => types.scalar.push(typeName)
  const addNonScalarType: AddNonScalarType = (typeName, createAble, fields) =>
    (types[createAble][typeName] = reduce(
      resolveBuildModeGenerator<Fields>(fields),
      (record, type, field) => {
        record[field] = typeToString(type)
        return record
      },
      {} as GQLRecord, // tslint:disable-line no-object-literal-type-assertion
    ))

  const addType: AddScalarType &
    AddNonScalarType &
    BuildModeArgsGenerator<
      BuildMode,
      AddScalarTypeArgs | AddNonScalarTypeArgs
    > = (buildModeBenerator, ...args) => {
    const [typeName, type, fields] = isBuildModeGenerator<
      BuildMode,
      AddScalarTypeArgs | AddNonScalarTypeArgs
    >(buildModeBenerator)
      ? buildModeBenerator(buildMode)
      : [buildModeBenerator, ...args]
    return type === 'scalar'
      ? addScalarType(typeName, type)
      : addNonScalarType(typeName, type, fields)
  }

  const builder = {
    builder: 'Build',
    buildMode,
    addQuery: createResolvable('Query'),
    addMutation: createResolvable('Mutation'),
    addSubscription: createResolvable('Subscription'),
    addType,
    toSchema: () => makeExecutableSchema(builder.toTypeDefs()),
    toTypeDefs: () => ({
      typeDefs: generateTypeDefs(resolvables, types),
      resolvers,
    }),
  }
  return builder
}

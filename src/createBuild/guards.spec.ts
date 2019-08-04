import {
  isAddEnumTypeConfig,
  isAddInputTypeConfig,
  isAddInterfaceTypeConfig,
  isAddObjectTypeConfig,
  isAddScalarTypeConfig,
} from './guards'

const testTypes = [
  {}, // only scalar
  { values: [] }, // no valid type, needs values
  { values: ['A', 'B', 'C'] }, // only enum
  { type: 'enum' }, // no valid type, needs values
  { type: 'enum', values: [] }, // only enum
  { type: 'enum', values: ['A'] }, // only enum
  { type: 'scalar' }, // only scalar
  { parseLiteral: () => null }, // only scalar
  { fields: {} }, // no valid type, needs fields
  { fields: { a: 'A' } }, // type
  { type: 'type', fields: {} }, // no valid type, needs fields
  { type: 'type', fields: { a: 'A' } }, // only type
  { type: 'input', fields: {} }, // no valid type, needs fields
  { type: 'input', fields: { a: 'A' } }, // only input
  { type: 'interface', fields: {} }, // no valid type, needs fields
  { type: 'interface', fields: { a: 'A' } }, // only input interface
]

const t = true
const f = false

const isValid = (fn: (type: any) => boolean, results: boolean[]) => () =>
  testTypes.forEach((type, index) =>
    it(`should validate ${JSON.stringify(type)} == ${results[index]}`, () =>
      expect(fn(type)).toEqual(results[index])),
  )

describe(
  'enum types',
  isValid(isAddEnumTypeConfig, [
    f,
    f,
    t,
    f,
    f,
    t,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
  ]),
)

describe(
  'scalar types',
  isValid(isAddScalarTypeConfig, [
    t,
    f,
    f,
    f,
    f,
    f,
    t,
    t,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
  ]),
)

describe(
  'interface types',
  isValid(isAddInterfaceTypeConfig, [
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    t,
  ]),
)

describe(
  'input types',
  isValid(isAddInputTypeConfig, [
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    t,
    f,
    f,
  ]),
)

describe(
  'object types',
  isValid(isAddObjectTypeConfig, [
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    f,
    t,
    f,
    t,
    f,
    f,
    f,
    f,
  ]),
)

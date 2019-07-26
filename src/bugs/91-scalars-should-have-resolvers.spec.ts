import { graphql } from 'graphql'
import { createBuild } from '..'

it('should allow scalars to have resolvers', async () => {
  const build = createBuild()
  const TestValue = 'MyVal-Value'
  const TestResultValue = 'Result-Value'
  let called = false

  build.addType('MyScalar', 'scalar', {
    parseValue: btoa,
    serialize: atob,
  })

  build.addQuery('val', 'MyScalar', {
    args: {
      myVal: 'MyScalar',
    },
    resolver: (_, { myVal }) => {
      expect(btoa(TestValue)).toBe(myVal)
      called = true
      return btoa(TestResultValue)
    },
  })

  const { typeDefs } = build.toTypeDefs()
  const schema = build.toSchema()
  const result = await graphql({
    schema,
    source: 'query($MyVal: MyScalar) { val(myVal: $MyVal) }',
    variableValues: { MyVal: TestValue },
  })
  expect(called).toBe(true)
  expect(result.data.val).toBe(TestResultValue)
})

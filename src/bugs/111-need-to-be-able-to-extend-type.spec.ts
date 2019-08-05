import { graphql } from 'graphql'
import { createSchemaBuilder } from '..'

it('should not at inherit to interface definitions', async () => {
  const builder = createSchemaBuilder()

  const model = builder.model('Model', {
    findOne: async () => ({
      id: '1234567890',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: new Date(),
    }),
  })
  model.attr('someInt', 'Int')
  model.resolve(() => ({
    someInt: () => 123,
  }))

  const build = builder.createBuild()
  build.extendType('Model', {
    fields: {
      someStr: 'String!',
    },
    resolver: {
      someStr: () => 'New String',
    },
  })

  const schema = build.toSchema()

  const { data } = await graphql({
    schema,
    source: '{ getModel(where: {}) { someInt someStr }}',
  })
  expect(data.getModel).toEqual({
    someInt: 123,
    someStr: 'New String',
  })
})

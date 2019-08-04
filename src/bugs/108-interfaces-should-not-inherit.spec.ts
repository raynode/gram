import { graphql } from 'graphql'
import { createSchemaBuilder } from '..'

it('should not at inherit to interface definitions', async () => {
  const builder = createSchemaBuilder()

  const model = builder.model('Model', { findOne: () => null })
  model.setInterface()

  expect(builder.createBuild().toTypeDefs().typeDefs).toMatchSnapshot()
})

import { GraphQLEnumType } from 'graphql'
import { createSchemaBuilder } from '..'

it('should build enum types', () => {
  const builder = createSchemaBuilder()

  const model = builder.model('Model')
  model.attr(
    'enum',
    new GraphQLEnumType({
      name: 'EnumValue',
      values: {
        EnumChoiceA: { value: 'enumValueA' },
        EnumChoiceB: { value: 'enumValueB' },
        EnumChoiceC: { value: 'enumValueC' },
      },
      description: 'Enum Value Test',
    }),
  )

  console.log(builder.createBuild().toTypeDefs().typeDefs)

  builder.build()
})

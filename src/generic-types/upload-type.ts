import { GraphQLScalarType } from 'graphql'

export const UploadType = new GraphQLScalarType({
  name: 'Upload',
  description: 'A special custom Scalar type for Uploads',

  serialize(upload: any) {
    console.log('serialize', upload)
    return upload
  },

  parseValue(value: any) {
    console.log('parseValue', value)
    return value
  },

  parseLiteral(ast: any) {
    console.log('parseLiteral', ast)
    return ast
  },
})

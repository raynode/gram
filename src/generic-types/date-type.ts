import { GraphQLScalarType, IntValueNode, StringValueNode } from 'graphql'

export const isIntValueNode = (node: any): node is IntValueNode =>
  node.kind === 'IntValue'
export const isStringValueNode = (node: any): node is StringValueNode =>
  node.kind === 'StringValue'

/**
 * A special custom Scalar type for Dates that converts to a ISO formatted string
 * @param {String} options.name:
 * @param {String} options.description:
 * @param {Date} options.serialize(date)
 * @param {String} parseValue(value)
 * @param {Object} parseLiteral(ast)
 */
export const DateType = new GraphQLScalarType({
  name: 'Date',
  description:
    'A special custom Scalar type for Dates that converts to a ISO formatted string ',

  serialize(date: Date) {
    if (!date) return null

    if (date instanceof Date) return date.toISOString()
    return date
  },

  parseValue(value: string | number) {
    if (!value) return null

    try {
      return new Date(value)
    } catch (e) {
      return null
    }
  },

  parseLiteral(ast) {
    if (isIntValueNode(ast) || isStringValueNode(ast))
      return new Date(ast.value)
    return null
  },
})

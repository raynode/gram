import { isType, isTypeDefinitionNode } from 'graphql'
import {
  AttributeBuilder,
  Builder,
  FieldDefinition,
  ModelBuilder,
  SchemaBuilder,
} from '../types'
import {
  ATTRIBUTEBUILDER,
  MODELBUILDER,
  SCHEMABUILDER,
} from '../types/constants'

export const isBuilder = (val: any): val is Builder =>
  val && typeof val.type === 'string'
export const isAttributeBuilder = <Context, Type, AttributeType>(
  val: any,
): val is AttributeBuilder<Context, Type, AttributeType> =>
  isBuilder(val) && val.type === ATTRIBUTEBUILDER
export const isModelBuilder = <Context, Type>(
  val: any,
): val is ModelBuilder<Context, Type> =>
  isBuilder(val) && val.type === MODELBUILDER
export const isSchemaBuilder = <Context>(
  val: any,
): val is SchemaBuilder<Context> =>
  isBuilder(val) && val.type === SCHEMABUILDER

export const isFieldDefinition = (val: any): val is FieldDefinition => {
  if (!val || typeof val !== 'object') return false
  return Object.keys(val).reduce(
    (result, key) =>
      result && typeof val[key] === 'object' && isType(val[key].type),
    true,
  )
}

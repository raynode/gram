
import { GraphQLInputFieldConfigMap, GraphQLInputType, isType, isScalarType, isObjectType } from 'graphql'
import { filterStrategy } from 'strategies/filter'
import { ContextModel } from 'types'
import { memoizeContextModel, reduceContextFields } from 'utils'
import { where as whereInput } from 'input-types/where'

export const data = memoizeContextModel((contextModel: ContextModel): GraphQLInputFieldConfigMap => {
  console.log('data-type:', contextModel.name)
  const result = reduceContextFields(contextModel, contextModel.baseFilters(), (where, field, name) => {
    // console.log(name, field.type, isScalarType(field.type), isObjectType(field.type))
    return ({
      ...where,
      ...(isScalarType(field.type) ? {
        [name]: { type: field.type as GraphQLInputType },
      } : {}),
      // [name]: { type: isType(field.type) ? field.type as GraphQLInputType : null },
    })
  })
  console.log(result)
  return result
})

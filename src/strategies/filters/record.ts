import { FilterFn } from '../../types'
export const record: FilterFn = (name, type, list) => ({
  [`${name}_in`]: list,
  [`${name}_not_in`]: list,
})

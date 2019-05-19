import { FilterFn } from '../../types'
export const record: FilterFn = (name, type, list) => ({
  [`${name}_in`]: { type: list },
  [`${name}_not_in`]: { type: list },
})

import { FilterFn } from '../../types'
export const equals: FilterFn = (name, type, list) => ({
  [`${name}`]: type,
  [`${name}_not`]: type,
})

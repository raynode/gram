import { FilterFn } from '../../types'
export const numeric: FilterFn = (name, type, list) => ({
  [`${name}_lt`]: type,
  [`${name}_gt`]: type,
})

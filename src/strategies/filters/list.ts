import { FilterFn } from '../../types'
export const list: FilterFn = (name, type, list) => ({
  [`${name}_contains`]: { type },
  [`${name}_not_contains`]: { type },
})

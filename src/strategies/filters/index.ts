import { FilterCheckFn, FilterFn } from '../../types'

export * from './equals'
export * from './list'
export * from './numeric'
export * from './record'

export const joinFilters = (filters: FilterFn[]): FilterFn => (
  name,
  type,
  list,
) =>
  filters.reduce(
    (result, filter) => ({ ...result, ...filter(name, type, list) }),
    {},
  )

export const joinValidators = (filters: FilterCheckFn[]): FilterCheckFn => (
  // prettier-ignore
  ...args,
) => filters.reduce((valid, check) => valid && check(...args), true)

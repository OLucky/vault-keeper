import { queryOptions } from '@tanstack/react-query'
import { ManifestSchema, CategoryIndexSchema } from './types'
import { formatValidationError, validateTableSet } from './validation'
import type { Manifest, CategoryIndex, TableSet } from './types'

export function manifestQueryOptions() {
  return queryOptions<Manifest>({
    queryKey: ['manifest'],
    queryFn: async () => {
      const path = `${import.meta.env.BASE_URL}tables/manifest.json`
      const response = await fetch(path)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`)
      }
      const json: unknown = await response.json()
      const result = ManifestSchema.safeParse(json)
      if (!result.success) {
        throw new Error(`Validation error in ${path}: ${formatValidationError(result.error)}`)
      }
      return result.data
    },
    staleTime: Infinity,
  })
}

export function categoryQueryOptions(categoryId: string) {
  return queryOptions<CategoryIndex>({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      const path = `${import.meta.env.BASE_URL}tables/${categoryId}/index.json`
      const response = await fetch(path)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`)
      }
      const json: unknown = await response.json()
      const result = CategoryIndexSchema.safeParse(json)
      if (!result.success) {
        throw new Error(`Validation error in ${path}: ${formatValidationError(result.error)}`)
      }
      return result.data
    },
  })
}

export function tableSetQueryOptions(categoryId: string, fileName: string) {
  return queryOptions<TableSet>({
    queryKey: ['tableSet', categoryId, fileName],
    queryFn: async () => {
      const path = `${import.meta.env.BASE_URL}tables/${categoryId}/${fileName}`
      const response = await fetch(path)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`)
      }
      const json: unknown = await response.json()
      const result = validateTableSet(json)
      if (!result.success) {
        throw new Error(`Validation error in ${path}: ${result.error}`)
      }
      return result.data
    },
  })
}

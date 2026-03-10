import { z } from 'zod'

export const DieType = z.string().regex(/^d\d+$/, 'Die type must be in format "dN" (e.g., d6, d20, d80)')
export type DieType = z.infer<typeof DieType>

export function getDieMax(die: DieType): number {
  return parseInt(die.slice(1), 10)
}

export const TriggerSchema = z
  .object({
    tableSet: z.string().optional(),
    tableId: z.string().optional(),
  })
  .refine((data) => data.tableSet !== undefined || data.tableId !== undefined, {
    message: 'Trigger must have at least one of tableSet or tableId',
  })
export type Trigger = z.infer<typeof TriggerSchema>

export const EntrySchema = z.object({
  range: z.tuple([z.number().int().min(1), z.number().int().min(1)]),
  title: z.string(),
  description: z.string().optional(),
  triggers: z.array(TriggerSchema).optional(),
})
export type Entry = z.infer<typeof EntrySchema>

export const ComputeSchema = z.object({
  dice: z.string().regex(/^\d+d\d+$/, 'Dice must be in format "NdX" (e.g., 3d6)'),
  method: z.enum(['lowest']),
})
export type Compute = z.infer<typeof ComputeSchema>

export const LookupTableSchema = z.object({
  name: z.string(),
  id: z.string().optional(),
  type: z.literal('lookup').optional(),
  die: DieType,
  conditional: z.boolean().optional(),
  entries: z.array(EntrySchema),
})

export const ComputedTableSchema = z.object({
  name: z.string(),
  id: z.string().optional(),
  type: z.literal('computed'),
  conditional: z.boolean().optional(),
  compute: ComputeSchema,
})

export const TableSchema = z.discriminatedUnion('type', [
  z.object({
    name: z.string(),
    id: z.string().optional(),
    type: z.literal('lookup'),
    die: DieType,
    conditional: z.boolean().optional(),
    entries: z.array(EntrySchema),
  }),
  ComputedTableSchema,
]).or(LookupTableSchema)
export type Table = z.infer<typeof TableSchema>

export const TableSetSchema = z.object({
  name: z.string(),
  tables: z.array(TableSchema),
})
export type TableSet = z.infer<typeof TableSetSchema>

export const CategoryIndexSchema = z.object({
  name: z.string(),
  tableSets: z.array(z.string()),
})
export type CategoryIndex = z.infer<typeof CategoryIndexSchema>

export const ManifestSchema = z.object({
  categories: z.array(z.string()),
})
export type Manifest = z.infer<typeof ManifestSchema>

export interface ResultField {
  tableName: string
  entry: { title: string; description?: string }
  tableIndex: number
  error?: string
  triggered?: boolean
  computed?: boolean
}

export interface GeneratedResult {
  id: string
  tableSetName: string
  categoryName: string
  fields: ResultField[]
}

import { z } from 'zod'

export const DieType = z.enum(['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'])
export type DieType = z.infer<typeof DieType>

export const DIE_MAX: Record<DieType, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
  d100: 100,
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

export const TableSchema = z.object({
  name: z.string(),
  id: z.string().optional(),
  die: DieType,
  conditional: z.boolean().optional(),
  entries: z.array(EntrySchema),
})
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
}

export interface GeneratedResult {
  id: string
  tableSetName: string
  categoryName: string
  fields: ResultField[]
}

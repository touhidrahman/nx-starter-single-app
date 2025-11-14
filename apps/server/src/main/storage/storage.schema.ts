import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { storageTable } from '../../db/schema'
import { zFile } from '../../models/common.schema'

export type InsertStorage = typeof storageTable.$inferInsert
export type SelectStorage = typeof storageTable.$inferSelect

export const zInsertStorage = createInsertSchema(storageTable)
export const zSelectStorage = createSelectSchema(storageTable)

export const zUpdateStorage = zInsertStorage
    .omit({
        createdAt: true,
        updatedAt: true,
    })
    .partial()
export const zUploadStorage = zUpdateStorage.extend(zFile.shape)

export const zDeleteStorage = z.object({
    ids: z.array(z.string()).min(1),
})

export const zUploadProfileImage = z.object({
    file: z.instanceof(File).optional(),
    entityId: z.string(),
    entityName: z.string(),
})

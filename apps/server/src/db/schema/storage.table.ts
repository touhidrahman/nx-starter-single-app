import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { fileTypeEnum, timestampColumns } from './_common.table'

export const storageTable = pgTable('storage', {
    id: text().primaryKey().$defaultFn(generateId),
    filename: text(),
    url: text(),
    type: fileTypeEnum().default('image'),
    extension: text(),
    size: integer().default(0),
    groupId: text().notNull(),
    uploadedBy: text(),
    entityName: text(),
    ...timestampColumns,
})

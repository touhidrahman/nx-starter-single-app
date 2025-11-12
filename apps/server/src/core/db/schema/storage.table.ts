import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { timestampColumns } from './_common.table'
import { generateId } from '../id.util'
import { fileTypeEnum } from './_common.table'

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

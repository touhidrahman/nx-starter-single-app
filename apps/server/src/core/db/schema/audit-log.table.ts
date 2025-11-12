import { jsonb, pgTable, text, varchar } from 'drizzle-orm/pg-core'
import { timestampColumns } from './_common.table'
import { generateId } from '../id.util'
import { actionStatusEnum } from './_common.table'

export const auditLogTable = pgTable('audit_logs', {
    id: text().primaryKey().$defaultFn(generateId),
    entity: varchar({ length: 100 }).notNull(),
    entityId: varchar({ length: 100 }).notNull(),
    creatorId: varchar({ length: 100 }).notNull(),
    action: actionStatusEnum().notNull(),
    previousData: jsonb().default({}),
    updatedData: jsonb().default({}),
    createdAt: timestampColumns.createdAt,
})

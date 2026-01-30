import { pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { groupsTable } from './groups.table'
import { usersTable } from './users.table'

export const referralCodesTable = pgTable('referral_codes', {
    id: text().primaryKey().$defaultFn(generateId),
    userId: text()
        .notNull()
        .references(() => usersTable.id, { onDelete: 'cascade' }),
    groupId: text()
        .references(() => groupsTable.id, { onDelete: 'cascade' })
        .notNull(),
    referralCode: text().notNull().unique(),
    ...timestampColumns,
})

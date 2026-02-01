import { index, pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { groupsTable } from './groups.table'
import { usersTable } from './users.table'

export const referralCodesTable = pgTable(
    'referral_codes',
    {
        id: text().primaryKey().$defaultFn(generateId),
        userId: text()
            .notNull()
            .references(() => usersTable.id, { onDelete: 'cascade' }),
        groupId: text()
            .references(() => groupsTable.id, { onDelete: 'cascade' })
            .notNull(),
        referralCode: text().notNull().unique(),
        ...timestampColumns,
    },
    (table) => [
        index('referral_codes_user_id_idx').on(table.userId),
        index('referral_codes_group_id_idx').on(table.groupId),
        index('referral_codes_user_id_group_id_idx').on(table.userId, table.groupId),
    ],
)

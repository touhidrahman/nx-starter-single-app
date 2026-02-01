import { index, integer, pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { referralCodesTable } from './referral-code.table'
import { usersTable } from './users.table'

export const referralsTable = pgTable(
    'referrals',
    {
        id: text().primaryKey().$defaultFn(generateId),
        referralCodeId: text()
            .notNull()
            .references(() => referralCodesTable.id, { onDelete: 'cascade' }),
        referredId: text().references(() => usersTable.id, {
            onDelete: 'cascade',
        }),
        points: integer().notNull().default(0),
        ...timestampColumns,
    },
    (table) => [
        index('referrals_referral_code_id_idx').on(table.referralCodeId),
        index('referrals_referred_id_idx').on(table.referredId),
    ],
)

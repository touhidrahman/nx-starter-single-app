import { relations } from 'drizzle-orm'
import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { referralCodesTable } from './referral-code.table'
import { usersTable } from './users.table'

export const referralsTable = pgTable('referrals', {
    id: text().primaryKey().$defaultFn(generateId),
    referralCodeId: text()
        .notNull()
        .references(() => referralCodesTable.id, { onDelete: 'cascade' }),
    referredId: text().references(() => usersTable.id, {
        onDelete: 'cascade',
    }),
    points: integer().notNull().default(0),
    ...timestampColumns,
})

export const referralsRelations = relations(referralsTable, ({ one }) => ({
    referralCode: one(referralCodesTable, {
        fields: [referralsTable.referralCodeId],
        references: [referralCodesTable.id],
    }),
    referredUser: one(usersTable, {
        fields: [referralsTable.referredId],
        references: [usersTable.id],
    }),
}))

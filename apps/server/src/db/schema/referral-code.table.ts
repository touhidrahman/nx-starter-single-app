import { relations } from 'drizzle-orm'
import { pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { groupsTable } from './groups.table'
import { referralsTable } from './referral.table'
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

export const referralCodeRelations = relations(referralCodesTable, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [referralCodesTable.userId],
        references: [usersTable.id],
    }),
    group: one(groupsTable, {
        fields: [referralCodesTable.groupId],
        references: [groupsTable.id],
    }),
    referrals: many(referralsTable),
}))

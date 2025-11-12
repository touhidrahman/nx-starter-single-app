import { relations } from 'drizzle-orm'
import { integer, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { usersTable } from './users.table'

export const userVerificationTable = pgTable(
    'user_verification',
    {
        id: text().primaryKey().$defaultFn(generateId),
        userId: text()
            .notNull()
            .references(() => usersTable.id, { onDelete: 'cascade' }),
        phone: text().notNull(),
        type: text().notNull(),
        verificationCode: integer().notNull(),
        expiresAt: timestamp({ withTimezone: true }),
        verifiedAt: timestamp({ withTimezone: true }),
        createdAt: timestamp({ withTimezone: true }).defaultNow(),
    },
    (table) => ({
        uniqueUserType: unique().on(table.userId, table.type),
    }),
)

export const userVerificationTableRelations = relations(
    userVerificationTable,
    ({ one }) => ({
        verification: one(usersTable, {
            fields: [userVerificationTable.userId],
            references: [usersTable.id],
        }),
    }),
)

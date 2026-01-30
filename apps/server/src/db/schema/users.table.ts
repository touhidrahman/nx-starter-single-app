import { AnyPgColumn, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { groupsTable } from './groups.table'

export const usersTable = pgTable('users', {
    id: text().primaryKey().$defaultFn(generateId),
    username: text().notNull().unique(),
    firstName: text().notNull(),
    lastName: text().notNull(),
    defaultGroupId: text().references((): AnyPgColumn => groupsTable.id),
    coverPhoto: text(),
    profilePhoto: text(),
    email: text(),
    password: text().notNull(),
    phone: text(),
    address1: text(),
    address2: text(),
    city: text(),
    state: text(),
    country: text(),
    zip: text(),
    lastLogin: timestamp({ withTimezone: true }),
    bannedAt: timestamp({ withTimezone: true }),
    verifiedAt: timestamp({ withTimezone: true }),
    ...timestampColumns,
})

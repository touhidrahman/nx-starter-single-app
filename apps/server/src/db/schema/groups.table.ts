import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { usersTable } from './users.table'

export const groupsTable = pgTable('groups', {
    id: text().primaryKey().$defaultFn(generateId),
    name: text().notNull(),
    email: text(),
    phone: text(),
    address1: text(),
    address2: text(),
    city: text(),
    state: text(),
    country: text(),
    zip: text(),
    creatorId: text().references(() => usersTable.id, { onDelete: 'set null' }),
    verifiedOn: timestamp({ withTimezone: true }),
    subscriptionId: text(),
    ...timestampColumns,
})

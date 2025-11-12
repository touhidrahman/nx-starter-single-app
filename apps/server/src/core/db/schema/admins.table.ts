import {
    pgTable,
    text,
    timestamp,
    uniqueIndex
} from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { lower } from '../orm.util'
import { timestampColumns } from './_common.table'

export const adminsTable = pgTable(
    'admins',
    {
        id: text().primaryKey().$defaultFn(generateId),
        name: text(),
        email: text().notNull(),
        password: text().notNull(),
        lastLogin: timestamp({ withTimezone: true }),
        bannedAt: timestamp({ withTimezone: true }),
        verifiedAt: timestamp({ withTimezone: true }),
        ...timestampColumns,
    },
    (table) => [uniqueIndex('adminEmailUniqueIndex').on(lower(table.email))],
)

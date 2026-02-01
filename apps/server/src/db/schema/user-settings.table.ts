import { index, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
import { usersTable } from './users.table'

export const usersSettingsTable = pgTable(
    'users_settings',
    {
        userId: text()
            .references(() => usersTable.id, { onDelete: 'cascade' })
            .notNull(),
        key: text().notNull(),
        value: text().notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.userId, table.key] }),
        index('users_settings_user_id_idx').on(table.userId),
    ],
)

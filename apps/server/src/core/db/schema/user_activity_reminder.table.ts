import { date, pgTable, text } from 'drizzle-orm/pg-core'
import { timestampColumns } from './_common.table'
import { generateId } from '../id.util'
import { usersTable } from './users.table'

export const userActivityReminderTable = pgTable('user_activity_reminder', {
    id: text().primaryKey().$defaultFn(generateId),
    userId: text().references(() => usersTable.id, {
        onDelete: 'set null',
    }),
    userPhone: text(),
    userEmail: text(),
    first_email_sent_date: date(),
    second_email_sent_date: date(),
    third_email_sent_date: date(),
    ...timestampColumns,
})

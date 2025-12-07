import { pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { feedbackStatusEnum, feedbackTypeEnum, timestampColumns } from './_common.table'
import { usersTable } from './users.table'

export const feedbackTable = pgTable('feedback', {
    id: text().primaryKey().$defaultFn(generateId),
    feedbackText: text().notNull(),
    feedbackType: feedbackTypeEnum(),
    status: feedbackStatusEnum().default('pending'),
    activePage: text(),
    fileUrls: text().array(),
    creatorId: text().references(() => usersTable.id, { onDelete: 'set null' }),
    ...timestampColumns,
})

import { boolean, pgTable, text } from 'drizzle-orm/pg-core'
import { timestampColumns } from './_common.table'
import { generateId } from '../id.util'

export const newsTickersTable = pgTable('news_tickers', {
    id: text().primaryKey().$defaultFn(generateId),
    title: text().notNull(),
    tickerUrl: text(),
    isActive: boolean().notNull().default(true),
    ...timestampColumns,
})

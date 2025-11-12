import { and, eq, getTableColumns, ilike, or } from 'drizzle-orm'
import { db } from '../../core/db/db'
import { newsTickersTable } from '../../core/db/schema'
import { InsertNewsTicker } from './news-ticker.schema'

export const createNewsTicker = async (newsTricker: InsertNewsTicker) =>
    await db.insert(newsTickersTable).values(newsTricker).returning()

export const findNewsTickerById = async (id: string) =>
    db.query.newsTickersTable.findFirst({
        where: eq(newsTickersTable.id, id),
    })

export const updateNewsTicker = async (
    id: string,
    newsTickerItem: Partial<InsertNewsTicker>,
) =>
    db
        .update(newsTickersTable)
        .set(newsTickerItem)
        .where(eq(newsTickersTable.id, id))
        .returning()

export const deleteNewsTicker = async (id: string) => {
    db.delete(newsTickersTable).where(eq(newsTickersTable.id, id)).returning()
}

export async function findManyNewsTickers(params: {
    search?: string
    status?: boolean
}) {
    const searchCondition = params.search
        ? getWhereCondition(params.search)
        : undefined

    const statusCondition =
        params.status !== undefined
            ? eq(newsTickersTable.isActive, params.status)
            : undefined

    const whereConditions = and(searchCondition, statusCondition)

    return db
        .select({
            ...getTableColumns(newsTickersTable),
        })
        .from(newsTickersTable)
        .where(whereConditions)
}

function getWhereCondition(search: string) {
    const searchCondition = search
        ? or(ilike(newsTickersTable.title, `%${search}%`))
        : undefined

    return and(...[searchCondition].filter(Boolean))
}

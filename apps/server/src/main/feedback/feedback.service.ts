import { and, count, eq, getTableColumns, ilike, SQL, sql } from 'drizzle-orm'

import { db } from '../../core/db/db'
import { feedbackTable, usersTable } from '../../core/db/schema'
import { InsertFeedback } from './feedback.schema'

export const getAllFeedbacks = async (params: {
    search: string
    page: number
    size: number
    orderBy?: string
}) => {
    const { search, page, size, orderBy } = params

    const conditions: SQL<unknown>[] = []

    if (search) {
        const searchTerm = `%${search}%`
        conditions.push(sql`(${ilike(feedbackTable.feedbackText, searchTerm)})`)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    const offset = (page - 1) * size

    const query = db
        .select({
            ...getTableColumns(feedbackTable),
            creatorName: usersTable.firstName,
        })
        .from(feedbackTable)
        .leftJoin(usersTable, eq(feedbackTable.creatorId, usersTable.id))
        .limit(size)
        .offset(offset)

    if (whereClause) {
        query.where(whereClause)
    }

    if (orderBy) {
        const direction = orderBy.toLowerCase() === 'desc' ? 'DESC' : 'ASC'
        query.orderBy(sql`${feedbackTable.createdAt} ${sql.raw(direction)}`)
    }

    const results = await query

    return {
        data: results,
        meta: {
            page,
            size,
        },
    }
}

export async function countFeedbacks() {
    const result = await db
        .select({
            count: count(),
        })
        .from(feedbackTable)

    return result[0]?.count ?? 0
}

export const findFeedbackById = async (id: string) => {
    return db.query.feedbackTable.findFirst({
        where: eq(feedbackTable.id, id),
    })
}

// In Feedback.service.ts
export const createFeedback = async (feedbackData: InsertFeedback) =>
    await db.insert(feedbackTable).values(feedbackData).returning()

export const updateFeedback = async (
    id: string,
    feedback: Partial<InsertFeedback>,
) =>
    await db
        .update(feedbackTable)
        .set(feedback)
        .where(eq(feedbackTable.id, id))
        .returning()

export const deleteFeedBack = async (id: string) =>
    await db.delete(feedbackTable).where(eq(feedbackTable.id, id)).returning()

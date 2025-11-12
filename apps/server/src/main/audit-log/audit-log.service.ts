import { and, count, eq, getTableColumns, ilike, SQL, sql } from 'drizzle-orm'
import { JSONValue } from 'jsonc-eslint-parser/lib/utils/ast'
import { db } from '../../core/db/db'
import { auditLogTable, usersTable } from '../../core/db/schema'
import { InsertLog } from './audit-log.schema'

export const getAllLogs = async (params: {
    search: string
    creatorId: string
    entityId: string
    action?: any
    page: number
    size: number
    orderBy: string
}) => {
    const { search, creatorId, action, entityId, page, size, orderBy } = params

    const conditions: SQL<unknown>[] = []

    if (search) {
        const searchTerm = `%${search}%`
        conditions.push(
            sql`(${ilike(auditLogTable.entity, searchTerm)} OR ${ilike(auditLogTable.action, searchTerm)})`,
        )
    }

    if (creatorId) {
        conditions.push(eq(auditLogTable.creatorId, creatorId))
    }

    if (action) {
        conditions.push(eq(auditLogTable.action, action))
    }

    if (entityId) {
        conditions.push(eq(auditLogTable.entityId, entityId))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    const offset = (page - 1) * size

    const query = db
        .select({
            ...getTableColumns(auditLogTable),
            creator: {
                id: usersTable.id,
                name: sql<string>`COALESCE(concat(${usersTable.firstName}, ' ', ${usersTable.lastName}), 'Deleted User')`.as(
                    'name',
                ),
                email: sql<string>`COALESCE(${usersTable.email}, '')`.as(
                    'email',
                ),
            },
        })
        .from(auditLogTable)
        .leftJoin(usersTable, eq(auditLogTable.creatorId, usersTable.id))
        .limit(size)
        .offset(offset)

    if (whereClause) {
        query.where(whereClause)
    }

    if (orderBy) {
        const direction = orderBy.toLowerCase() === 'desc' ? 'DESC' : 'ASC'
        query.orderBy(sql`${auditLogTable.createdAt} ${sql.raw(direction)}`)
    }

    const totalCounts = await db
        .select({ count: count() })
        .from(auditLogTable)
        .leftJoin(usersTable, eq(auditLogTable.creatorId, usersTable.id))
        .where(whereClause)

    const results = await query

    return {
        data: results,
        meta: {
            page,
            size,
            total: totalCounts[0]?.count || 0,
        },
    }
}

export async function countlogs(entityId: string) {
    const result = await db
        .select({
            count: count(),
        })
        .from(auditLogTable)
        .where(eq(auditLogTable.entityId, entityId))

    return result[0]?.count ?? 0
}
// Retrieve a specific case by ID.
export const findLogById = async (id: string) =>
    db.query.auditLogTable.findFirst({
        where: eq(auditLogTable.id, id),
    })

// Insert a new case.
export const createLog = async (data: InsertLog) =>
    await db.insert(auditLogTable).values(data).returning()

export const createManyLog = async (items: InsertLog[]) =>
    await db.insert(auditLogTable).values(items).returning()

// Remove a case by ID.
export const deleteLog = async (id: string) =>
    db.delete(auditLogTable).where(eq(auditLogTable.id, id)).returning()

// delete by entityId
export const deleteLogByEntityId = async (entityId: string) =>
    db
        .delete(auditLogTable)
        .where(eq(auditLogTable.entityId, entityId))
        .returning()

// Check existence of a case by ID.
export const logExists = async (id: string) => {
    const result = await db
        .select({ value: count() })
        .from(auditLogTable)
        .where(eq(auditLogTable.id, id))
    return result?.[0]?.value === 1
}

export const saveLog = async (
    entity: string,
    entityId: string,
    creatorId: string,
    action: 'create' | 'update' | 'delete',
    previousData: JSONValue,
    updatedData: JSONValue,
) => {
    await db
        .insert(auditLogTable)
        .values({
            entity,
            entityId,
            creatorId,
            action,
            previousData,
            updatedData,
        })
        .returning()
}

export function toJsonSafe<T extends object>(data: T): JSONValue {
    return JSON.parse(JSON.stringify(data))
}

import { and, eq, getTableColumns, ilike, SQL, sql } from 'drizzle-orm'
import { db } from '../../db/db'
import { storageTable } from '../../db/schema'
import { getFileType } from '../../utils/file.util'

export const getStorageItemById = async (id: string) => {
    const [result] = await db
        .select({ ...getTableColumns(storageTable) })
        .from(storageTable)
        .where(eq(storageTable.id, id))
        .limit(1)
    return result ? result : null
}

export const getStorageItemsByGroup = async (params: {
    search: string
    groupId: string
    page: number
    size: number
    orderBy?: string
}) => {
    const { search, groupId, page, size, orderBy } = params

    const conditions: SQL<unknown>[] = []

    if (search) {
        const searchTerm = `%${search}%`
        conditions.push(
            sql`(${ilike(storageTable.entityName, searchTerm)} OR ${ilike(storageTable.filename, searchTerm)} )`,
        )
    }

    if (groupId) {
        conditions.push(eq(storageTable.groupId, groupId))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    const offset = (page - 1) * size

    const query = db
        .select({
            ...getTableColumns(storageTable),
        })
        .from(storageTable)
        .limit(size)
        .offset(offset)

    if (whereClause) {
        query.where(whereClause)
    }

    if (orderBy) {
        const direction = orderBy.toLowerCase() === 'desc' ? 'DESC' : 'ASC'
        query.orderBy(sql`${storageTable.createdAt} ${sql.raw(direction)}`)
    }

    const results = await query

    const totalCountQuery = db
        .select({
            count: sql<number>`count(*)`,
        })
        .from(storageTable)

    if (whereClause) {
        totalCountQuery.where(whereClause)
    }

    const totalCountResult = await totalCountQuery
    const totalCount = totalCountResult[0]?.count || 0

    return {
        data: results,
        meta: {
            page,
            size,
            totalCount,
            totalPages: Math.ceil(totalCount / size),
        },
    }
}

export async function createStorageRecord(data: {
    file: File
    url: string
    entityName: string
    groupId: string
    uploadedBy: string
}) {
    const hashedName = data.url.split('/').pop()
    return db
        .insert(storageTable)
        .values({
            filename: data.file.name,
            url: data.url,
            type: getFileType(data.file),
            size: data.file.size,
            extension: data.file.name.split('.').pop(),
            groupId: data.groupId,
            entityName: data.entityName,
            uploadedBy: data.uploadedBy,
        })
        .returning()
}

export async function deleteStorageItemById(id: string) {
    return db.delete(storageTable).where(eq(storageTable.id, id)).returning()
}

export const getStorageItemByGroupId = async (groupId: string) => {
    const [result] = await db
        .select({ ...getTableColumns(storageTable) })
        .from(storageTable)
        .where(eq(storageTable.groupId, groupId))
        .limit(1)
    return result ? result : null
}

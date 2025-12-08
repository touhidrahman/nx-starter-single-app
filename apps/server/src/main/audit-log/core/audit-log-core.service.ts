import { and, eq, ilike, inArray, or, SQL, sql } from 'drizzle-orm'
import { db } from '../../../db/db'
import { auditLogTable } from '../../../db/schema'
import { DEFAULT_PAGE_SIZE } from '../../../models/common.values'
import { InsertAuditLog, QueryAuditLogs, SelectAuditLog } from './audit-log-core.model'

export class AuditLogCoreService {
    static async findMany(filters: QueryAuditLogs): Promise<SelectAuditLog[]> {
        const conditions = AuditLogCoreService.buildWhereConditions(filters)
        const size = filters.size || DEFAULT_PAGE_SIZE
        const offset = ((filters.page || 1) - 1) * size
        const logs = await db
            .select()
            .from(auditLogTable)
            .where(conditions)
            .offset(offset)
            .limit(size)
        return logs as unknown as SelectAuditLog[]
    }

    static async findOne(filters: QueryAuditLogs): Promise<SelectAuditLog | null> {
        const conditions = AuditLogCoreService.buildWhereConditions(filters)
        const logs = await db.select().from(auditLogTable).where(conditions).limit(1)
        return (logs[0] as unknown as SelectAuditLog) ?? null
    }

    static async findById(id: string): Promise<SelectAuditLog | null> {
        const log = await db.select().from(auditLogTable).where(eq(auditLogTable.id, id)).limit(1)
        return (log[0] as unknown as SelectAuditLog) || null
    }

    static async exists(id: string): Promise<boolean> {
        const countResult = await db
            .select({ count: sql<number>`count(${auditLogTable.id})` })
            .from(auditLogTable)
            .where(eq(auditLogTable.id, id))
        const count = countResult[0]?.count || 0
        return count > 0
    }

    static async count(filters: QueryAuditLogs): Promise<number> {
        const conditions = AuditLogCoreService.buildWhereConditions(filters)

        const [{ count }] = await db
            .select({ count: sql<number>`count(${auditLogTable.id})` })
            .from(auditLogTable)
            .where(conditions)
        return count
    }

    static async create(input: InsertAuditLog): Promise<SelectAuditLog> {
        const [log] = await db.insert(auditLogTable).values(input).returning()
        return log as unknown as SelectAuditLog
    }

    static async createMany(inputs: InsertAuditLog[]): Promise<SelectAuditLog[]> {
        const logs = await db.insert(auditLogTable).values(inputs).returning()
        return logs as unknown as SelectAuditLog[]
    }

    static async update(id: string, input: Partial<InsertAuditLog>): Promise<SelectAuditLog> {
        const [log] = await db
            .update(auditLogTable)
            .set(input)
            .where(eq(auditLogTable.id, id))
            .returning()
        return log as unknown as SelectAuditLog
    }

    static async upsert(id: string, input: InsertAuditLog): Promise<SelectAuditLog> {
        const existing = await AuditLogCoreService.findById(id)
        if (existing) {
            return AuditLogCoreService.update(id, input)
        }
        return AuditLogCoreService.create(input)
    }

    static async delete(id: string): Promise<void> {
        await db.delete(auditLogTable).where(eq(auditLogTable.id, id))
    }

    static async deleteMany(ids: string[]): Promise<void> {
        await db.delete(auditLogTable).where(inArray(auditLogTable.id, ids))
    }

    static async deleteManyByQuery(filters: QueryAuditLogs): Promise<void> {
        const conditions = AuditLogCoreService.buildWhereConditions(filters)
        await db.delete(auditLogTable).where(conditions)
    }

    static buildWhereConditions(params: QueryAuditLogs): SQL<unknown> | undefined {
        const conditions: (SQL<unknown> | undefined)[] = []

        if (params.search) {
            const searchTerm = `%${params.search.trim()}%`
            conditions.push(
                or(
                    ilike(auditLogTable.entity, searchTerm),
                    ilike(auditLogTable.entityId, searchTerm),
                ),
            )
        }
        if (params.ids && params.ids.length > 0) {
            conditions.push(inArray(auditLogTable.id, params.ids))
        }
        if (params.creatorId) {
            conditions.push(eq(auditLogTable.creatorId, params.creatorId))
        }
        if (params.entity) {
            conditions.push(eq(auditLogTable.entity, params.entity))
        }
        if (params.entityId) {
            conditions.push(eq(auditLogTable.entityId, params.entityId))
        }
        if (params.action) {
            conditions.push(eq(auditLogTable.action, params.action))
        }
        if (conditions.length === 0) {
            return undefined
        }
        return and(...conditions)
    }
}

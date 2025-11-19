import { and, eq, ilike, inArray, or, SQL, sql } from 'drizzle-orm'
import { db } from '../../../db/db'
import { invitesTable } from '../../../db/schema'
import { DEFAULT_PAGE_SIZE } from '../../../models/common.values'
import { InsertInvite, QueryInvites, SelectInvite } from './invite-core.model'

export class InviteCoreService {
    static async findMany(filters: QueryInvites): Promise<SelectInvite[]> {
        const conditions = InviteCoreService.buildWhereConditions(filters)
        const size = filters.size || DEFAULT_PAGE_SIZE
        const offset = ((filters.page || 1) - 1) * size
        const invites = await db
            .select()
            .from(invitesTable)
            .where(conditions)
            .offset(offset)
            .limit(size)
        return invites
    }

    static async findOne(filters: QueryInvites): Promise<SelectInvite | null> {
        const conditions = InviteCoreService.buildWhereConditions(filters)
        const invites = await db
            .select()
            .from(invitesTable)
            .where(conditions)
            .limit(1)
        return invites[0] ?? null
    }

    static async findById(id: string): Promise<SelectInvite | null> {
        const invite = await db
            .select()
            .from(invitesTable)
            .where(eq(invitesTable.id, id))
            .limit(1)
        return invite[0] || null
    }

    static async exists(id: string): Promise<boolean> {
        const countResult = await db
            .select({ count: sql<number>`count(${invitesTable.id})` })
            .from(invitesTable)
            .where(eq(invitesTable.id, id))
        const count = countResult[0]?.count || 0
        return count > 0
    }

    static async count(filters: QueryInvites): Promise<number> {
        const conditions = InviteCoreService.buildWhereConditions(filters)

        const [{ count }] = await db
            .select({ count: sql<number>`count(${invitesTable.id})` })
            .from(invitesTable)
            .where(conditions)
        return count
    }

    static async create(input: InsertInvite): Promise<SelectInvite> {
        const [invite] = await db.insert(invitesTable).values(input).returning()
        return invite
    }

    static async createMany(inputs: InsertInvite[]): Promise<SelectInvite[]> {
        const invites = await db.insert(invitesTable).values(inputs).returning()
        return invites
    }

    static async update(
        id: string,
        input: Partial<InsertInvite>,
    ): Promise<SelectInvite> {
        const [invite] = await db
            .update(invitesTable)
            .set(input)
            .where(eq(invitesTable.id, id))
            .returning()
        return invite
    }

    static async upsert(
        id: string,
        input: InsertInvite,
    ): Promise<SelectInvite> {
        const existingInvite = await InviteCoreService.findById(id)
        if (existingInvite) {
            return InviteCoreService.update(id, input)
        }
        return InviteCoreService.create(input)
    }

    static async delete(id: string): Promise<void> {
        await db.delete(invitesTable).where(eq(invitesTable.id, id))
    }

    static async deleteMany(ids: string[]): Promise<void> {
        await db.delete(invitesTable).where(inArray(invitesTable.id, ids))
    }

    static buildWhereConditions(
        params: QueryInvites,
    ): SQL<unknown> | undefined {
        const conditions: (SQL<unknown> | undefined)[] = []

        if (params.search) {
            const searchTerm = `%${params.search.trim()}%`
            conditions.push(or(ilike(invitesTable.email, searchTerm)))
        }
        if (params.ids && params.ids.length > 0) {
            conditions.push(inArray(invitesTable.id, params.ids))
        }
        if (params.groupId) {
            conditions.push(eq(invitesTable.groupId, params.groupId))
        }
        if (params.invitedBy) {
            conditions.push(eq(invitesTable.invitedBy, params.invitedBy))
        }
        if (params.email) {
            conditions.push(eq(invitesTable.email, params.email))
        }
        if (conditions.length === 0) {
            return undefined
        }
        return and(...conditions)
    }
}

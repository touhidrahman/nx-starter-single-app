import { and, eq, inArray, SQL, sql } from 'drizzle-orm'
import { db } from '../../../db/db'
import { referralsTable } from '../../../db/schema'
import { DEFAULT_PAGE_SIZE } from '../../../models/common.values'
import { InsertReferral, QueryReferrals, SelectReferral } from './referral-core.model'

export class ReferralCoreService {
    static async findMany(filters: QueryReferrals): Promise<SelectReferral[]> {
        const conditions = ReferralCoreService.buildWhereConditions(filters)
        const size = filters.size || DEFAULT_PAGE_SIZE
        const offset = ((filters.page || 1) - 1) * size
        const referrals = await db
            .select()
            .from(referralsTable)
            .where(conditions)
            .offset(offset)
            .limit(size)
        return referrals
    }

    static async findOne(filters: QueryReferrals): Promise<SelectReferral | null> {
        const conditions = ReferralCoreService.buildWhereConditions(filters)
        const referrals = await db.select().from(referralsTable).where(conditions).limit(1)
        return referrals[0] ?? null
    }

    static async findById(id: string): Promise<SelectReferral | null> {
        const referral = await db
            .select()
            .from(referralsTable)
            .where(eq(referralsTable.id, id))
            .limit(1)
        return referral[0] || null
    }

    static async exists(id: string): Promise<boolean> {
        const countResult = await db
            .select({ count: sql<number>`count(${referralsTable.id})` })
            .from(referralsTable)
            .where(eq(referralsTable.id, id))
        const count = countResult[0]?.count || 0
        return count > 0
    }

    static async count(filters: QueryReferrals): Promise<number> {
        const conditions = ReferralCoreService.buildWhereConditions(filters)

        const [{ count }] = await db
            .select({ count: sql<number>`count(${referralsTable.id})` })
            .from(referralsTable)
            .where(conditions)
        return count
    }

    static async create(input: InsertReferral): Promise<SelectReferral> {
        const [referral] = await db.insert(referralsTable).values(input).returning()
        return referral
    }

    static async createMany(inputs: InsertReferral[]): Promise<SelectReferral[]> {
        const referrals = await db.insert(referralsTable).values(inputs).returning()
        return referrals
    }

    static async update(id: string, input: Partial<InsertReferral>): Promise<SelectReferral> {
        const [referral] = await db
            .update(referralsTable)
            .set(input)
            .where(eq(referralsTable.id, id))
            .returning()
        return referral
    }

    static async delete(id: string): Promise<void> {
        await db.delete(referralsTable).where(eq(referralsTable.id, id))
    }

    static buildWhereConditions(params: QueryReferrals): SQL<unknown> | undefined {
        const conditions: (SQL<unknown> | undefined)[] = []

        if (params.id) {
            conditions.push(eq(referralsTable.id, params.id))
        }
        if (params.referralCodeId) {
            conditions.push(eq(referralsTable.referralCodeId, params.referralCodeId))
        }
        if (params.referredId) {
            conditions.push(eq(referralsTable.referredId, params.referredId))
        }
        if (params.ids && params.ids.length > 0) {
            conditions.push(inArray(referralsTable.id, params.ids))
        }
        if (conditions.length === 0) {
            return undefined
        }
        return and(...conditions)
    }
}

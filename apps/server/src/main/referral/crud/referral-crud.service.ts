import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/db'
import { referralsTable } from '../../../db/schema'
import { InsertReferral, QueryReferrals, SelectReferral } from '../core/referral-core.model'
import { ReferralCoreService } from '../core/referral-core.service'

export class ReferralCrudService extends ReferralCoreService {
    static async findByIdForUser(
        id: string,
        referralCodeId: string,
    ): Promise<SelectReferral | null> {
        const referral = await db
            .select()
            .from(referralsTable)
            .where(
                and(eq(referralsTable.id, id), eq(referralsTable.referralCodeId, referralCodeId)),
            )
            .limit(1)
        return referral[0] || null
    }

    static async findManyForUser(
        filters: QueryReferrals,
        referralCodeId: string,
    ): Promise<SelectReferral[]> {
        const modifiedFilters = { ...filters, referralCodeId }
        return ReferralCoreService.findMany(modifiedFilters)
    }

    static async countForUser(filters: QueryReferrals, referralCodeId: string): Promise<number> {
        const modifiedFilters = { ...filters, referralCodeId }
        return ReferralCoreService.count(modifiedFilters)
    }

    static async createForUser(
        input: InsertReferral,
        referralCodeId: string,
    ): Promise<SelectReferral> {
        return ReferralCoreService.create({ ...input, referralCodeId })
    }

    static async updateForUser(
        id: string,
        input: Partial<InsertReferral>,
        referralCodeId: string,
    ): Promise<SelectReferral | null> {
        const referral = await ReferralCrudService.findByIdForUser(id, referralCodeId)
        if (!referral) {
            return null
        }
        return ReferralCoreService.update(id, input)
    }

    static async deleteForUser(id: string, referralCodeId: string): Promise<boolean> {
        const referral = await ReferralCrudService.findByIdForUser(id, referralCodeId)
        if (!referral) {
            return false
        }
        await ReferralCoreService.delete(id)
        return true
    }
}

import { eq } from 'drizzle-orm'
import { db } from '../../../db/db'
import { pricingPlanTable, subscriptionsTable } from '../../../db/schema'
import { QuerySubscriptions } from '../core/subscription-core.model'
import { SubscriptionCoreService } from '../core/subscription-core.service'
import { SubscriptionWithPlan } from './subscription-crud.model'

export class SubscriptionCrudService extends SubscriptionCoreService {
    static async findByGroupId(groupId: string): Promise<SubscriptionWithPlan | null> {
        return SubscriptionCrudService.findOne({ groupId })
    }

    static async findOne(filters: QuerySubscriptions): Promise<SubscriptionWithPlan | null> {
        const conditions = SubscriptionCoreService.buildWhereConditions(filters)
        const [result] = await db
            .select({ subscriptionsTable, pricingPlanTable })
            .from(subscriptionsTable)
            .where(conditions)
            .leftJoin(pricingPlanTable, eq(subscriptionsTable.planId, pricingPlanTable.id))
            .limit(1)
        if (!result) return null

        return {
            ...result.subscriptionsTable,
            plan: result.pricingPlanTable ?? null,
        }
    }

    static async findById(id: string): Promise<SubscriptionWithPlan | null> {
        const [result] = await db
            .select({ subscriptionsTable, pricingPlanTable })
            .from(subscriptionsTable)
            .where(eq(subscriptionsTable.id, id))
            .leftJoin(pricingPlanTable, eq(subscriptionsTable.planId, pricingPlanTable.id))
            .limit(1)
        if (!result) return null

        return {
            ...result.subscriptionsTable,
            plan: result.pricingPlanTable ?? null,
        }
    }
}

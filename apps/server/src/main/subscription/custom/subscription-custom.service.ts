import { eq } from 'drizzle-orm'
import { db } from '../../../db/db'
import { pricingPlanTable, subscriptionsTable } from '../../../db/schema'
import { SubscriptionCrudService } from '../crud/subscription-crud.service'

export class SubscriptionCustomService extends SubscriptionCrudService {
    static async checkSubscriptionLimits(groupId: string) {
        return db
            .select({
                maxUsers: pricingPlanTable.maxUsers,
                maxStorage: pricingPlanTable.storageLimit,
            })
            .from(subscriptionsTable)
            .innerJoin(pricingPlanTable, eq(subscriptionsTable.planId, pricingPlanTable.id))
            .where(eq(subscriptionsTable.groupId, groupId))
            .limit(1)
    }
}

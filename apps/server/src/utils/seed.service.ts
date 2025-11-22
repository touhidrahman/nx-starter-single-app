import { eq } from 'drizzle-orm'
import { db } from '../db/db'
import { pricingPlanTable } from '../db/schema'
import { InsertPlan } from '../main/plan/core/plan-core.model'
import { PlanCustomService } from '../main/plan/custom/plan-custom.service'

export const seedPlans = async (plans: InsertPlan[]) => {
    for (const p of plans) {
        const findPlanByName = await db.query.pricingPlanTable.findFirst({
            where: eq(pricingPlanTable.name, p.name),
        })

        if (!findPlanByName) {
            await PlanCustomService.create(p)
        }
    }
}

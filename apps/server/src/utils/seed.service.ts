import { eq } from 'drizzle-orm'
import { InsertPlan } from '../../main/plan/plan.schema'
import { db } from '../db/db'
import { pricingPlanTable } from '../db/schema'

export const seedPlans = async (plans: InsertPlan[]) => {
    for (const p of plans) {
        const findPlanByName = await db.query.pricingPlanTable.findFirst({
            where: eq(pricingPlanTable.name, p.name),
        })

        if (findPlanByName) {
            throw new Error(`Plan ${p.name} already exists`)
        }

        await insertPlan(p)
    }
}

export const insertPlan = async (plan: InsertPlan) => {
    const storageLimit = plan.storageLimit * 1024 * 1000
    return db
        .insert(pricingPlanTable)
        .values({ ...plan, storageLimit })
        .returning()
}

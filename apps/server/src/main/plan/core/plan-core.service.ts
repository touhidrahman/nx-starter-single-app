import { and, eq, ilike, inArray, or, SQL, sql } from 'drizzle-orm'
import { db } from '../../../db/db'
import { pricingPlanTable } from '../../../db/schema'
import { DEFAULT_PAGE_SIZE } from '../../../models/common.values'
import { InsertPlan, QueryPlans, SelectPlan } from './plan-core.model'

export class PlanCoreService {
    static async findMany(filters: QueryPlans): Promise<SelectPlan[]> {
        const conditions = PlanCoreService.buildWhereConditions(filters)
        const size = filters.size || DEFAULT_PAGE_SIZE
        const offset = ((filters.page || 1) - 1) * size
        const plans = await db
            .select()
            .from(pricingPlanTable)
            .where(conditions)
            .offset(offset)
            .limit(size)
        return plans
    }

    static async findOne(filters: QueryPlans): Promise<SelectPlan | null> {
        const conditions = PlanCoreService.buildWhereConditions(filters)
        const plans = await db.select().from(pricingPlanTable).where(conditions).limit(1)
        return plans[0] ?? null
    }

    static async findById(id: string): Promise<SelectPlan | null> {
        const plan = await db
            .select()
            .from(pricingPlanTable)
            .where(eq(pricingPlanTable.id, id))
            .limit(1)
        return plan[0] || null
    }

    static async exists(id: string): Promise<boolean> {
        const countResult = await db
            .select({ count: sql<number>`count(${pricingPlanTable.id})` })
            .from(pricingPlanTable)
            .where(eq(pricingPlanTable.id, id))
        const count = countResult[0]?.count || 0
        return count > 0
    }

    static async count(filters: QueryPlans): Promise<number> {
        const conditions = PlanCoreService.buildWhereConditions(filters)

        const [{ count }] = await db
            .select({ count: sql<number>`count(${pricingPlanTable.id})` })
            .from(pricingPlanTable)
            .where(conditions)
        return count
    }

    static async create(input: InsertPlan): Promise<SelectPlan> {
        const [plan] = await db.insert(pricingPlanTable).values(input).returning()
        return plan
    }

    static async createMany(inputs: InsertPlan[]): Promise<SelectPlan[]> {
        const plans = await db.insert(pricingPlanTable).values(inputs).returning()
        return plans
    }

    static async update(id: string, input: Partial<InsertPlan>): Promise<SelectPlan> {
        const [plan] = await db
            .update(pricingPlanTable)
            .set(input)
            .where(eq(pricingPlanTable.id, id))
            .returning()
        return plan
    }

    static async upsert(id: string, input: InsertPlan): Promise<SelectPlan> {
        const existingPlan = await PlanCoreService.findById(id)
        if (existingPlan) {
            return PlanCoreService.update(id, input)
        }
        return PlanCoreService.create(input)
    }

    static async delete(id: string): Promise<void> {
        await db.delete(pricingPlanTable).where(eq(pricingPlanTable.id, id))
    }

    static async deleteMany(ids: string[]): Promise<void> {
        await db.delete(pricingPlanTable).where(inArray(pricingPlanTable.id, ids))
    }

    static buildWhereConditions(params: QueryPlans): SQL<unknown> | undefined {
        const conditions: (SQL<unknown> | undefined)[] = []

        if (params.search) {
            const searchTerm = `%${params.search.trim()}%`
            conditions.push(
                or(
                    ilike(pricingPlanTable.name, searchTerm),
                    ilike(pricingPlanTable.description, searchTerm),
                ),
            )
        }
        if (params.ids && params.ids.length > 0) {
            conditions.push(inArray(pricingPlanTable.id, params.ids))
        }
        if (params.isActive !== undefined) {
            conditions.push(eq(pricingPlanTable.isActive, params.isActive))
        }
        if (params.currency) {
            conditions.push(eq(pricingPlanTable.currency, params.currency))
        }
        if (conditions.length === 0) {
            return undefined
        }
        return and(...conditions)
    }
}

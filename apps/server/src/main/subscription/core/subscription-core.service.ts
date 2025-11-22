import { and, eq, inArray, SQL, sql } from 'drizzle-orm'
import { db } from '../../../db/db'
import { subscriptionsTable } from '../../../db/schema'
import { DEFAULT_PAGE_SIZE } from '../../../models/common.values'
import {
    InsertSubscription,
    QuerySubscriptions,
    SelectSubscription,
} from './subscription-core.model'

export class SubscriptionCoreService {
    static async findMany(
        filters: QuerySubscriptions,
    ): Promise<SelectSubscription[]> {
        const conditions = SubscriptionCoreService.buildWhereConditions(filters)
        const size = filters.size || DEFAULT_PAGE_SIZE
        const offset = ((filters.page || 1) - 1) * size
        const rows = (await db
            .select()
            .from(subscriptionsTable)
            .where(conditions)
            .offset(offset)
            .limit(size)) as unknown as SelectSubscription[]
        return rows
    }

    static async findOne(
        filters: QuerySubscriptions,
    ): Promise<SelectSubscription | null> {
        const conditions = SubscriptionCoreService.buildWhereConditions(filters)
        const rows = (await db
            .select()
            .from(subscriptionsTable)
            .where(conditions)
            .limit(1)) as unknown as SelectSubscription[]
        return rows[0] ?? null
    }

    static async findById(id: string): Promise<SelectSubscription | null> {
        const rows = (await db
            .select()
            .from(subscriptionsTable)
            .where(eq(subscriptionsTable.id, id))
            .limit(1)) as unknown as SelectSubscription[]
        return rows[0] ?? null
    }

    static async exists(id: string): Promise<boolean> {
        const [{ count }] = await db
            .select({ count: sql<number>`count(${subscriptionsTable.id})` })
            .from(subscriptionsTable)
            .where(eq(subscriptionsTable.id, id))
        return (count || 0) > 0
    }

    static async count(filters: QuerySubscriptions): Promise<number> {
        const conditions = SubscriptionCoreService.buildWhereConditions(filters)
        const [{ count }] = await db
            .select({ count: sql<number>`count(${subscriptionsTable.id})` })
            .from(subscriptionsTable)
            .where(conditions)
        return count || 0
    }

    static async create(
        input: InsertSubscription,
    ): Promise<SelectSubscription> {
        const [row] = (await db
            .insert(subscriptionsTable)
            .values(input)
            .returning()) as unknown as SelectSubscription[]
        return row
    }

    static async createMany(
        inputs: InsertSubscription[],
    ): Promise<SelectSubscription[]> {
        const rows = (await db
            .insert(subscriptionsTable)
            .values(inputs)
            .returning()) as unknown as SelectSubscription[]
        return rows
    }

    static async update(
        id: string,
        input: Partial<InsertSubscription>,
    ): Promise<SelectSubscription> {
        const [row] = (await db
            .update(subscriptionsTable)
            .set(input)
            .where(eq(subscriptionsTable.id, id))
            .returning()) as unknown as SelectSubscription[]
        return row
    }

    static async delete(id: string): Promise<void> {
        await db.delete(subscriptionsTable).where(eq(subscriptionsTable.id, id))
    }

    static buildWhereConditions(
        params: QuerySubscriptions,
    ): SQL<unknown> | undefined {
        const conditions: (SQL<unknown> | undefined)[] = []

        if (params.id) conditions.push(eq(subscriptionsTable.id, params.id))
        if (params.groupId)
            conditions.push(eq(subscriptionsTable.groupId, params.groupId))
        if (params.planId)
            conditions.push(eq(subscriptionsTable.planId, params.planId))
        if (params.creatorId)
            conditions.push(eq(subscriptionsTable.creatorId, params.creatorId))
        if (params.approverId)
            conditions.push(
                eq(subscriptionsTable.approverId, params.approverId),
            )
        if (params.ids && params.ids.length > 0)
            conditions.push(inArray(subscriptionsTable.id, params.ids))
        if (params.isTrial !== undefined)
            conditions.push(eq(subscriptionsTable.isTrial, params.isTrial))
        if (params.autoRenewal !== undefined)
            conditions.push(
                eq(subscriptionsTable.autoRenewal, params.autoRenewal),
            )

        return conditions.length ? and(...conditions) : undefined
    }
}

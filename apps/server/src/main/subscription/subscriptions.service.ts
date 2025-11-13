import {
    and,
    count,
    eq,
    getTableColumns,
    gt,
    ilike,
    inArray,
    isNull,
    or,
    SQL,
    sql,
} from 'drizzle-orm'
import { db } from '../../core/db/db'
import {
    groupsTable,
    pricingPlanTable,
    subscriptionsTable,
} from '../../core/db/schema'
import { InsertSubscription } from './subscription.schema'

export const getAllSubscriptions = async (params: {
    search?: string
    page: number
    size: number
    orderBy?: string
    plan?: string
}) => {
    const { search, page, size, orderBy, plan } = params

    const conditions: SQL<unknown>[] = []

    if (search) {
        const searchTerm = `%${search}%`
        conditions.push(sql`(${ilike(pricingPlanTable.name, searchTerm)})`)
    }

    if (plan) {
        conditions.push(eq(pricingPlanTable.name, plan))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    const offset = (page - 1) * size

    const query = db
        .select({
            ...getTableColumns(subscriptionsTable),
            planName: pricingPlanTable.name,
            groupName: groupsTable.name,
        })
        .from(subscriptionsTable)
        .leftJoin(
            pricingPlanTable,
            eq(subscriptionsTable.planId, pricingPlanTable.id),
        )
        .leftJoin(groupsTable, eq(subscriptionsTable.groupId, groupsTable.id))
        .limit(size)
        .offset(offset)

    if (whereClause) {
        query.where(whereClause)
    }

    if (orderBy) {
        const direction = orderBy.toLowerCase() === 'desc' ? 'DESC' : 'ASC'
        query.orderBy(
            sql`${subscriptionsTable.createdAt} ${sql.raw(direction)}`,
        )
    }

    const results = await query

    return {
        data: results,
        meta: {
            page,
            size,
        },
    }
}

export async function countSubscription() {
    const result = await db
        .select({ count: count(subscriptionsTable) })
        .from(subscriptionsTable)

    return result[0]?.count ?? 0
}

export const findSubscriptionByGroupId = async (groupId: string) => {
    return db
        .select()
        .from(subscriptionsTable)
        .where(and(eq(subscriptionsTable.groupId, groupId)))
        .limit(1)
        .execute()
}

export const findActiveSubscriptionByGroupId = async (groupId: string) => {
    const res = await db
        .select()
        .from(subscriptionsTable)
        .where(
            and(
                eq(subscriptionsTable.groupId, groupId),
                or(
                    isNull(subscriptionsTable.endDate),
                    gt(subscriptionsTable.endDate, new Date()),
                ),
            ),
        )
        .limit(1)
        .execute()

    return res[0] || null
}

export const findSubscriptionByGroupIdAndId = async (
    groupId: string,
    id: string,
) => {
    return await db
        .select({
            id: subscriptionsTable.id,
            groupId: subscriptionsTable.groupId,
            planId: subscriptionsTable.planId,
            isTrial: subscriptionsTable.isTrial,
            autoRenewal: subscriptionsTable.autoRenewal,
            paymentMethod: subscriptionsTable.paymentMethod,
            transactionId: subscriptionsTable.transactionId,
            createdAt: subscriptionsTable.createdAt,
            updatedAt: subscriptionsTable.updatedAt,
            groupName: groupsTable.name,
            planName: pricingPlanTable.name,
        })
        .from(subscriptionsTable)
        .where(
            and(
                eq(subscriptionsTable.groupId, groupId),
                eq(subscriptionsTable.id, id),
            ),
        )
        .leftJoin(groupsTable, eq(subscriptionsTable.groupId, groupsTable.id))
        .leftJoin(
            pricingPlanTable,
            eq(subscriptionsTable.planId, pricingPlanTable.id),
        )
        .limit(1)
        .execute()
        .then((res) => res[0])
}

export const updateSubscriptionStatus = async (
    id: string,
    approved: boolean,
    approverId: string,
) => {
    return db
        .update(subscriptionsTable)
        .set({ approvedAt: approved ? new Date() : null, approverId })
        .where(eq(subscriptionsTable.id, id))
        .returning()
}

export const findSubscriptionById = async (id: string) => {
    const subscription = await db
        .select(getTableColumns(subscriptionsTable))
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.id, id))
        .limit(1)

    return subscription[0] || null
}

export const createSubscription = async (subscription: InsertSubscription) => {
    return db.insert(subscriptionsTable).values(subscription).returning()
}
export const updateSubscriptionById = async (
    id: string,
    groupId: string,
    updateData: Partial<InsertSubscription>,
) => {
    return db
        .update(subscriptionsTable)
        .set(updateData)
        .where(
            and(
                eq(subscriptionsTable.id, id),
                eq(subscriptionsTable.groupId, groupId),
            ),
        )
        .returning()
}
export const deleteSubscriptionById = async (id: string) => {
    return db
        .delete(subscriptionsTable)
        .where(eq(subscriptionsTable.id, id))
        .returning()
}

export const deleteManySubscriptionsByIds = async (ids: string[]) => {
    return db
        .delete(subscriptionsTable)
        .where(and(inArray(subscriptionsTable.id, ids)))
        .returning()
}

export const checkSubscriptionLimits = async (groupId: string) => {
    return db
        .select({
            maxUsers: pricingPlanTable.maxUsers,
            maxStorage: pricingPlanTable.storageLimit,
        })
        .from(subscriptionsTable)
        .innerJoin(
            pricingPlanTable,
            eq(subscriptionsTable.planId, pricingPlanTable.id),
        )
        .where(eq(subscriptionsTable.groupId, groupId))
        .limit(1)
}

import {
    and,
    count,
    eq,
    getTableColumns,
    ilike,
    inArray,
    SQL,
    sql,
} from 'drizzle-orm'
import { db } from '../../core/db/db'
import {
    groupsTable,
    pricingPlanTable,
    subscriptionsTable,
} from '../../core/db/schema'
import { subscriptionsRequestTable } from '../../core/db/schema/subscriptions-request.table'
import {
    InsertSubscription,
    InsertSubscriptionRequest,
} from './subscription.schema'

export const getAllSubscriptions = async (params: {
    search?: string
    page: number
    size: number
    orderBy?: string
    plan?: string
    subscriptionType?: string
    status?: string
}) => {
    const { search, page, size, orderBy, plan, subscriptionType, status } =
        params

    const conditions: SQL<unknown>[] = []

    if (search) {
        const searchTerm = `%${search}%`
        conditions.push(
            sql`(${ilike(subscriptionsTable.status, searchTerm)} OR ${ilike(subscriptionsTable.subscriptionType, searchTerm)} OR ${ilike(pricingPlanTable.name, searchTerm)})`,
        )
    }

    if (plan) {
        conditions.push(eq(pricingPlanTable.name, plan))
    }

    if (subscriptionType) {
        if (subscriptionType === 'monthly' || subscriptionType === 'yearly') {
            conditions.push(
                eq(subscriptionsTable.subscriptionType, subscriptionType),
            )
        }
    }

    if (status && (status === 'active' || status === 'inactive')) {
        conditions.push(
            eq(subscriptionsTable.status, status as 'active' | 'inactive'),
        )
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

export const getAllSubscriptionsRequest = async (params: {
    search?: string
    page: number
    size: number
    orderBy?: string
    plan?: string
    subscriptionType?: string
    status?: string
}) => {
    const { search, page, size, orderBy, plan, subscriptionType, status } =
        params

    const conditions: SQL<unknown>[] = []

    if (search) {
        const searchTerm = `%${search}%`
        conditions.push(
            sql`(${ilike(subscriptionsRequestTable.status, searchTerm)} OR ${ilike(subscriptionsRequestTable.subscriptionType, searchTerm)} OR ${ilike(pricingPlanTable.name, searchTerm)})`,
        )
    }

    if (plan) {
        conditions.push(eq(pricingPlanTable.name, plan))
    }

    if (subscriptionType) {
        if (subscriptionType === 'monthly' || subscriptionType === 'yearly') {
            conditions.push(
                eq(
                    subscriptionsRequestTable.subscriptionType,
                    subscriptionType,
                ),
            )
        }
    }

    if (status && (status === 'pending' || status === 'approved')) {
        conditions.push(
            eq(
                subscriptionsRequestTable.status,
                status as 'pending' | 'approved',
            ),
        )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    const offset = (page - 1) * size

    const query = db
        .select({
            ...getTableColumns(subscriptionsRequestTable),
            planName: pricingPlanTable.name,
            groupName: groupsTable.name,
        })
        .from(subscriptionsRequestTable)
        .leftJoin(
            pricingPlanTable,
            eq(subscriptionsRequestTable.planId, pricingPlanTable.id),
        )
        .leftJoin(
            groupsTable,
            eq(subscriptionsRequestTable.groupId, groupsTable.id),
        )
        .limit(size)
        .offset(offset)

    if (whereClause) {
        query.where(whereClause)
    }

    if (orderBy) {
        const direction = orderBy.toLowerCase() === 'desc' ? 'DESC' : 'ASC'
        query.orderBy(
            sql`${subscriptionsRequestTable.createdAt} ${sql.raw(direction)}`,
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

export async function countSubscriptionRequest() {
    const result = await db
        .select({ count: count(subscriptionsRequestTable) })
        .from(subscriptionsRequestTable)

    return result[0]?.count ?? 0
}

export const findActiveSubscriptionByGroupId = async (groupId: string) => {
    return db
        .select()
        .from(subscriptionsTable)
        .where(
            and(
                eq(subscriptionsTable.groupId, groupId),
                eq(subscriptionsTable.status, 'active'),
            ),
        )
        .limit(1)
        .execute()
}

export const findActiveSubscriptionsByGroupId = async (groupId: string) => {
    return db
        .select()
        .from(subscriptionsTable)
        .where(
            and(
                eq(subscriptionsTable.groupId, groupId),
                eq(subscriptionsTable.status, 'active'),
            ),
        )
        .execute()
}

export const findSubscriptionRequestByGroupId = async (groupId: string) => {
    return await db
        .select()
        .from(subscriptionsRequestTable)
        .where(
            and(
                eq(subscriptionsRequestTable.groupId, groupId),
                eq(subscriptionsRequestTable.status, 'pending'),
            ),
        )
        .limit(1)
        .execute()
}

export const findSubscriptionRequestByGroupIdAndId = async (
    groupId: string,
    id: string,
) => {
    return await db
        .select({
            id: subscriptionsRequestTable.id,
            groupId: subscriptionsRequestTable.groupId,
            planId: subscriptionsRequestTable.planId,
            isTrial: subscriptionsRequestTable.isTrial,
            autoRenewal: subscriptionsRequestTable.autoRenewal,
            paymentMethod: subscriptionsRequestTable.paymentMethod,
            transactionId: subscriptionsRequestTable.transactionId,
            status: subscriptionsRequestTable.status,
            statusChangeDate: subscriptionsRequestTable.statusChangeDate,
            subscriptionType: subscriptionsRequestTable.subscriptionType,
            createdAt: subscriptionsRequestTable.createdAt,
            updatedAt: subscriptionsRequestTable.updatedAt,
            groupName: groupsTable.name,
            planName: pricingPlanTable.name,
        })
        .from(subscriptionsRequestTable)
        .where(
            and(
                eq(subscriptionsRequestTable.groupId, groupId),
                eq(subscriptionsRequestTable.id, id),
                eq(subscriptionsRequestTable.status, 'pending'),
            ),
        )
        .leftJoin(
            groupsTable,
            eq(subscriptionsRequestTable.groupId, groupsTable.id),
        )
        .leftJoin(
            pricingPlanTable,
            eq(subscriptionsRequestTable.planId, pricingPlanTable.id),
        )
        .limit(1)
        .execute()
        .then((res) => res[0])
}

export const updateSubscriptionRequestStatus = async (
    id: string,
    status: 'pending' | 'approved',
) => {
    return await db
        .update(subscriptionsRequestTable)
        .set({ status, statusChangeDate: new Date().toISOString() })
        .where(eq(subscriptionsRequestTable.id, id))
        .execute()
}

// Find all subscriptions by groupId
export const findAllByGroupId = async (groupId: string) => {
    return db
        .select(getTableColumns(subscriptionsTable))
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.groupId, groupId))
        .limit(100)
}

// Find a subscription by ID
export const findById = async (id: string) => {
    const subscription = await db
        .select(getTableColumns(subscriptionsTable))
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.id, id))
        .limit(1)

    return subscription[0] || null
}

// Find a subscription by GroupID
export const findByGroupId = async (groupId: string) => {
    const subscription = await db
        .select({
            ...getTableColumns(subscriptionsTable),
            planName: pricingPlanTable.name,
        })
        .from(subscriptionsTable)
        .innerJoin(
            pricingPlanTable,
            eq(subscriptionsTable.planId, pricingPlanTable.id),
        )
        .where(
            and(
                eq(subscriptionsTable.groupId, groupId),
                eq(subscriptionsTable.status, 'active'),
            ),
        )
        .limit(1)

    return subscription[0] || null
}
// Find  subscription list by GroupID
export const findSubscriptionListByGroupId = async (groupId: string) => {
    const subscriptions = await db
        .select(getTableColumns(subscriptionsTable))
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.groupId, groupId))

    return subscriptions
}

// Create a new subscription
export const createSubscription = async (subscription: InsertSubscription) => {
    return db.insert(subscriptionsTable).values(subscription).returning()
}

export const createSubscriptionRequest = async (
    subscription: InsertSubscriptionRequest,
) => {
    return db.insert(subscriptionsRequestTable).values(subscription).returning()
}

// Update an existing subscription by ID
export const updateById = async (
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

export const inactiveActiveSubscription = async (groupId: string) => {
    return db
        .update(subscriptionsTable)
        .set({ status: 'inactive' })
        .where(eq(subscriptionsTable.groupId, groupId))
        .returning()
}
// Delete a subscription by ID
export const deleteById = async (id: string) => {
    return db
        .delete(subscriptionsTable)
        .where(eq(subscriptionsTable.id, id))
        .returning()
}

// Delete multiple subscriptions by IDs and groupId
export const deleteManyByIds = async (ids: string[], groupId: string) => {
    return db
        .delete(subscriptionsTable)
        .where(
            and(
                inArray(subscriptionsTable.id, ids),
                eq(subscriptionsTable.groupId, groupId),
            ),
        )
        .returning()
}

export const checkSubscriptionLimits = async (groupId: string) => {
    return db
        .select({
            maxCases: pricingPlanTable.maxCases,
            maxUsers: pricingPlanTable.maxUsers,
            maxStorage: pricingPlanTable.storageLimit,
            maxCauseEnrollment: pricingPlanTable.maxCauselistEnrollment,
        })
        .from(subscriptionsTable)
        .innerJoin(
            pricingPlanTable,
            eq(subscriptionsTable.planId, pricingPlanTable.id),
        )
        .where(eq(subscriptionsTable.groupId, groupId))
        .limit(1)
}

export const calculateEndDate = (
    startDate: Date,
    subscriptionType: 'monthly' | 'yearly',
): Date | null => {
    const endDate = new Date(startDate)

    switch (subscriptionType) {
        case 'monthly':
            endDate.setMonth(startDate.getMonth() + 1)
            return endDate
        case 'yearly':
            endDate.setFullYear(startDate.getFullYear() + 1)
            return endDate
        default:
            return null
    }
}

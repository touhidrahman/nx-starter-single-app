import {
    and,
    count,
    eq,
    getTableColumns,
    gte,
    ilike,
    SQL,
    sql,
} from 'drizzle-orm'
import { db } from '../../db/db'
import {
    invitesTable,
    membershipsTable,
    pricingPlanTable,
    rolesTable,
    subscriptionsTable,
} from '../../db/schema'
import { GroupLimitResult, InviteDto } from './invite.schema'

export async function createInvite(invite: InviteDto, invitedByUserId: string) {
    return db
        .insert(invitesTable)
        .values({ ...invite, invitedBy: invitedByUserId })
        .returning()
}

export const getAllInvites = async (params: {
    search: string
    page: number
    size: number
    orderBy?: string
    groupId?: string
}) => {
    const { search, page, size, orderBy, groupId } = params

    const conditions: SQL<unknown>[] = []

    if (search) {
        const searchTerm = `%${search}%`
        conditions.push(
            sql`(${ilike(invitesTable.email, searchTerm)} OR ${ilike(invitesTable.roleId, searchTerm)} )`,
        )
    }
    if (groupId) {
        conditions.push(sql`${invitesTable.groupId} = ${groupId}`)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    const offset = (page - 1) * size

    const query = db
        .select({
            ...getTableColumns(invitesTable),
            roleName: rolesTable.name,
        })
        .from(invitesTable)
        .leftJoin(rolesTable, sql`${invitesTable.roleId} =${rolesTable.id}`)
        .limit(size)
        .offset(offset)

    if (whereClause) {
        query.where(whereClause)
    }

    if (orderBy) {
        const direction = orderBy.toLowerCase() === 'desc' ? 'DESC' : 'ASC'
        query.orderBy(sql`${invitesTable.invitedOn} ${sql.raw(direction)}`)
    }

    const results = await query

    const totalCountQuery = db
        .select({
            count: sql<number>`count(*)`,
        })
        .from(invitesTable)

    if (whereClause) {
        totalCountQuery.where(whereClause)
    }

    const totalCountResult = await totalCountQuery
    const totalCount = totalCountResult[0]?.count || 0

    return {
        data: results,
        meta: {
            page,
            size,
            totalCount,
            totalPages: Math.ceil(totalCount / size),
        },
    }
}

// Retrieve a specific invitation by ID.
export const findInvitationById = async (id: string) =>
    db.query.invitesTable.findFirst({
        where: eq(invitesTable.id, id),
    })

export const deleteInvitation = async (id: string) =>
    db.delete(invitesTable).where(eq(invitesTable.id, id)).returning()

export const deleteInvitationByEmail = async (email: string) =>
    db.delete(invitesTable).where(eq(invitesTable.email, email)).returning()

export async function updateInviteStatus(id: string, status: string) {
    return db
        .update(invitesTable)
        .set({
            acceptedOn: status === 'accepted' ? new Date() : undefined,
        })
        .where(eq(invitesTable.id, id))
        .returning()
}

export async function updateInviteStatusForEmail(
    email: string,
    status: string,
) {
    return db
        .update(invitesTable)
        .set({
            acceptedOn: status === 'accepted' ? new Date() : undefined,
        })
        .where(eq(invitesTable.email, email))
        .returning()
}

async function getActiveSubscription(groupId: string) {
    return db
        .select()
        .from(subscriptionsTable)
        .where(
            and(
                eq(subscriptionsTable.groupId, groupId),
                gte(subscriptionsTable.endDate, new Date()),
            ),
        )
        .limit(1)
        .then((res) => res[0])
}

async function getPlanDetails(planId: string) {
    return db
        .select({
            id: pricingPlanTable.id,
            name: pricingPlanTable.name,
            maxUsers: pricingPlanTable.maxUsers,
        })
        .from(pricingPlanTable)
        .where(eq(pricingPlanTable.id, planId))
        .limit(1)
        .then((res) => res[0])
}

async function countGroupMembers(
    groupId: string,
    source: 'invites' | 'users' = 'users',
) {
    const table = source === 'invites' ? invitesTable : membershipsTable
    return db
        .select({ count: count() })
        .from(table)
        .where(eq(table.groupId, groupId))
        .then((res) => res[0]?.count || 0)
}

export async function checkGroupLimit(
    groupId: string,
    options?: {
        countSource?: 'invites' | 'users' | 'both'
        reserveSpace?: number
    },
): Promise<GroupLimitResult> {
    const subscription = await getActiveSubscription(groupId)
    if (!subscription) {
        return {
            canAdd: false,
            currentUsers: 0,
            maxUsers: 0,
            message: 'No active subscription found',
        }
    }

    const plan = await getPlanDetails(subscription.planId)
    if (!plan) {
        return {
            canAdd: false,
            currentUsers: 0,
            maxUsers: 0,
            message: 'Subscription plan not found',
        }
    }

    let currentUsers = 0

    if (options?.countSource === 'both') {
        const invitesCount = await countGroupMembers(groupId, 'invites')
        const usersCount = await countGroupMembers(groupId, 'users')
        currentUsers = invitesCount + usersCount
    } else {
        currentUsers = await countGroupMembers(
            groupId,
            options?.countSource || 'users',
        )
    }

    const effectiveMax = plan.maxUsers - (options?.reserveSpace || 0)
    const canAdd = currentUsers < effectiveMax

    return {
        canAdd,
        currentUsers,
        maxUsers: plan.maxUsers,
        planName: plan.name,
        message: canAdd
            ? undefined
            : `Maximum users (${plan.maxUsers}) reached for ${plan.name} plan`,
    }
}

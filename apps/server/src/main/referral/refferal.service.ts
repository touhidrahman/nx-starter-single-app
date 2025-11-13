import { and, eq, gte, sql } from 'drizzle-orm'
import { db } from '../../core/db/db'
import {
    membershipsTable,
    pricingPlanTable,
    referralCodesTable,
    referralsTable,
    subscriptionsTable,
    usersTable,
} from '../../core/db/schema'
import { DateUtil } from '../../core/utils/date.util'

export const findReferralCodeRecord = async (refCode: string) => {
    return db
        .select()
        .from(referralCodesTable)
        .where(eq(referralCodesTable.referralCode, refCode))
}

export const createReferral = async (refCodeId: string, userId: string) => {
    return db
        .insert(referralsTable)
        .values({
            referralCodeId: refCodeId,
            referredId: userId,
            points: 200,
        })
        .returning()
}

export const getReferredUsers = async (userId: string) => {
    return db
        .select({
            id: usersTable.id,
            email: usersTable.email,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
            planName: pricingPlanTable.name,
        })
        .from(referralsTable)
        .innerJoin(
            referralCodesTable,
            eq(referralsTable.referralCodeId, referralCodesTable.id),
        )
        .innerJoin(usersTable, eq(referralsTable.referredId, usersTable.id))
        .innerJoin(membershipsTable, eq(membershipsTable.userId, usersTable.id))
        .innerJoin(
            subscriptionsTable,
            eq(subscriptionsTable.groupId, membershipsTable.groupId),
        )
        .innerJoin(
            pricingPlanTable,
            eq(pricingPlanTable.id, subscriptionsTable.planId),
        )
        .where(
            and(
                eq(referralCodesTable.userId, userId),
                gte(subscriptionsTable.endDate, DateUtil.date()),
            ),
        )
}

export const getReferredPoints = async (userId: string) => {
    const result = await db
        .select({
            totalPoints: sql<number>`SUM(CASE WHEN ${pricingPlanTable.monthlyPrice} > 0 THEN 200 ELSE 0 END)`,
        })
        .from(referralsTable)
        .innerJoin(
            referralCodesTable,
            eq(referralsTable.referralCodeId, referralCodesTable.id),
        )
        .innerJoin(usersTable, eq(referralsTable.referredId, usersTable.id))
        .innerJoin(membershipsTable, eq(membershipsTable.userId, usersTable.id))
        .innerJoin(
            subscriptionsTable,
            eq(subscriptionsTable.groupId, membershipsTable.groupId),
        )
        .innerJoin(
            pricingPlanTable,
            eq(pricingPlanTable.id, subscriptionsTable.planId),
        )
        .where(
            and(
                eq(referralCodesTable.userId, userId),
                gte(subscriptionsTable.endDate, DateUtil.date()),
            ),
        )

    return result[0]?.totalPoints ?? 0
}

export const findReferralCode = async (userId: string) => {
    return db.query.referralCodesTable.findFirst({
        where: eq(referralCodesTable.userId, userId),
    })
}

export const findReferralPoints = async (userId: string) => {
    const result = await db
        .select({
            referralCodeId: referralsTable.referralCodeId,
            referredId: referralsTable.referredId,
            points: referralsTable.points,
            planName: pricingPlanTable.name,
        })
        .from(referralsTable)
        .innerJoin(
            referralCodesTable,
            eq(referralsTable.referralCodeId, referralCodesTable.id),
        )
        .innerJoin(usersTable, eq(referralsTable.referredId, usersTable.id))
        .innerJoin(membershipsTable, eq(membershipsTable.userId, usersTable.id))
        .innerJoin(
            subscriptionsTable,
            eq(subscriptionsTable.groupId, membershipsTable.groupId),
        )
        .innerJoin(
            pricingPlanTable,
            eq(pricingPlanTable.id, subscriptionsTable.planId),
        )
        .where(
            and(
                eq(referralsTable.referredId, userId),
                gte(subscriptionsTable.endDate, DateUtil.date()),
            ),
        )
        .limit(1)

    return result[0] || null
}

export const updateReferralCode = async (ref: string, refId: string) => {
    return db
        .update(referralCodesTable)
        .set({ referralCode: ref })
        .where(eq(referralCodesTable.id, refId))
        .returning()
}

export const createRefCode = async (data: {
    userId: string
    groupId: string
    referralCode: string
}) => {
    return db.insert(referralCodesTable).values(data).returning()
}

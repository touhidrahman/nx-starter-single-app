import { createRoute, z } from '@hono/zod-openapi'
import { and, eq, sql } from 'drizzle-orm'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { db } from '../../../db/db'
import { groupsTable, subscriptionsTable } from '../../../db/schema'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { ApiResponse } from '../../../utils/api-response.util'

export const getGroupOwnerOverviewByGroupIdRoute = createRoute({
    path: '/group/overview',
    tags: ['Group'],
    method: 'get',
    middleware: [checkToken] as const,
    responses: {
        [OK]: ApiResponse(
            z.object({
                storageUsed: z.number(),
            }),
            'Group details',
        ),
    },
})

export const getGroupOwnerOverviewByGroupIdHandler: AppRouteHandler<
    typeof getGroupOwnerOverviewByGroupIdRoute
> = async (c) => {
    const { groupId } = await c.get('jwtPayload')

    const [result] = await db
        .select({
            storageUsed:
                sql<number>`CAST(COALESCE(SUM(${subscriptionsTable.usedStorage}), 0) AS INTEGER)`.as(
                    'storageUsed',
                ),
        })
        .from(groupsTable)
        .leftJoin(
            subscriptionsTable,
            eq(groupsTable.id, subscriptionsTable.groupId),
        )
        .where(eq(groupsTable.id, groupId))

    return c.json(
        {
            data: result,
            message: 'Group overview',
            success: true,
        },
        OK,
    )
}

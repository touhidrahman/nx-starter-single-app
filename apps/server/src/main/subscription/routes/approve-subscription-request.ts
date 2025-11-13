import { createRoute, z } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../../core/middlewares/is-admin.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { zSelectSubscription } from '../subscription.schema'
import {
    findSubscriptionById,
    updateSubscriptionStatus,
} from '../subscriptions.service'

export const approveSubscriptionRoute = createRoute({
    path: '/v1/subscriptions/:id/approve',
    tags: ['Subscriptions'],
    method: 'put',
    middleware: [checkToken, isAdmin] as const,
    request: {
        body: jsonContent(
            z.object({ approved: z.boolean(), groupId: z.string() }),
            'subscription request',
        ),
    },
    responses: {
        [OK]: ApiResponse(zSelectSubscription, 'Subscription details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Subscription not found'),
    },
})

export const approveSubscriptionRequestHandler: AppRouteHandler<
    typeof approveSubscriptionRoute
> = async (c) => {
    const body = c.req.valid('json')
    const payload = await c.get('jwtPayload')
    const id = c.req.param('id')
    const subscription = await findSubscriptionById(id)

    if (!subscription) {
        return c.json(
            {
                data: {},
                message: 'Subscription not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    const [res] = await updateSubscriptionStatus(id, body.approved, payload.sub)

    await saveLog(
        'subscriptions',
        subscription.id,
        payload.sub,
        'update',
        toJsonSafe(subscription),
        toJsonSafe(res),
    )

    return c.json(
        {
            data: res,
            message: 'Subscription details',
            success: true,
        },
        OK,
    )
}

import { createRoute } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { FORBIDDEN, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isAdmin } from '../../../middlewares/is-admin.middleware'
import { zId } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS } from '../../../models/common.values'
import { ApiResponse } from '../../../utils/api-response.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import { zSelectSubscription } from '../core/subscription-core.model'
import { zSubscriptionWithPlan } from '../crud/subscription-crud.model'
import { SubscriptionCustomService } from './subscription-custom.service'

const tags = [APP_OPENAPI_TAGS.Subscription]
const path = '/custom/subscriptions'

const GetMySubscriptionCustomDef = createRoute({
    path: `${path}/my`,
    tags,
    method: 'get',
    middleware: [checkToken] as const,
    responses: { [OK]: ApiResponse(zSubscriptionWithPlan, 'My subscription') },
})

const GetMySubscriptionCustom: AppRouteHandler<
    typeof GetMySubscriptionCustomDef
> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'User is not a member of any group',
        })
    }
    const data = await SubscriptionCustomService.findByGroupId(groupId)
    if (!data) {
        throw new HTTPException(NOT_FOUND, {
            message: 'Subscription not found',
        })
    }
    return c.json({ data, message: 'Subscription fetched', success: true }, OK)
}

const ApproveSubscriptionDef = createRoute({
    path: `${path}/:id/approve`,
    tags,
    method: 'post',
    middleware: [checkToken, isAdmin] as const,
    request: { params: zId },
    responses: {
        [OK]: ApiResponse(zSelectSubscription, 'Approve subscription'),
    },
})

const ApproveSubscription: AppRouteHandler<
    typeof ApproveSubscriptionDef
> = async (c) => {
    const { sub: approverId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id
    const data = await SubscriptionCustomService.findById(id)
    if (!data) {
        throw new HTTPException(NOT_FOUND, {
            message: 'Subscription not found',
        })
    }
    const approvedSubscription = await SubscriptionCustomService.update(id, {
        approvedAt: new Date(),
        approverId,
    })
    return c.json(
        {
            data: approvedSubscription,
            message: 'Subscription approved',
            success: true,
        },
        OK,
    )
}

export const subscriptionCustomRoutes = createRouter()
    .openapi(GetMySubscriptionCustomDef, GetMySubscriptionCustom)
    .openapi(ApproveSubscriptionDef, ApproveSubscription)

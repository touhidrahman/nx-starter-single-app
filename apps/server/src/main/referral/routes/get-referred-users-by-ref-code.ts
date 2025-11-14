import { createRoute, z } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isGroupOwner } from '../../../middlewares/is-group-owner.middleware'
import { zEmptyList } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { zSelectReferredUsers } from '../referral.schema'
import { getReferredUsers } from '../refferal.service'

export const getReferredUsersRoute = createRoute({
    path: '/v1/referred-users',
    method: 'get',
    tags: ['Referral Code'],
    middleware: [checkToken, isGroupOwner] as const,
    responses: {
        [OK]: ApiResponse(
            z.array(zSelectReferredUsers),
            'Referred Users Details',
        ),
        [NOT_FOUND]: ApiResponse(zEmptyList, 'Not found!'),
    },
})

export const getReferredUsersHandler: AppRouteHandler<
    typeof getReferredUsersRoute
> = async (c) => {
    const { sub } = c.get('jwtPayload')

    const referredUsers = await getReferredUsers(sub)

    if (!referredUsers || referredUsers.length === 0) {
        return c.json(
            {
                data: [],
                message: 'No referred users found',
                success: false,
                error: true,
            },
            NOT_FOUND,
        )
    }
    return c.json(
        {
            data: referredUsers,
            message: 'Referred users',
            success: true,
            error: false,
        },
        OK,
    )
}

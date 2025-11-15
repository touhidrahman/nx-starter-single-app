import { createRoute } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isGroupOwner } from '../../../middlewares/is-group-owner.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { zSelectReferralCode } from '../referral.schema'
import { findReferralCode } from '../refferal.service'

export const getReferralCodeRoute = createRoute({
    path: '/referral-code',
    method: 'get',
    tags: ['Referral Code'],
    middleware: [checkToken, isGroupOwner] as const,
    responses: {
        [OK]: ApiResponse(zSelectReferralCode, 'Referral Code Details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Not found!'),
    },
})

export const getReferralCodeHandler: AppRouteHandler<
    typeof getReferralCodeRoute
> = async (c) => {
    const { sub } = c.get('jwtPayload')

    const findCode = await findReferralCode(sub)

    if (!findCode) {
        return c.json(
            {
                data: {},
                message: 'No referral code found',
                success: false,
                error: true,
            },
            NOT_FOUND,
        )
    }
    return c.json(
        {
            data: findCode,
            message: 'Referral code',
            success: true,
            error: false,
        },
        OK,
    )
}

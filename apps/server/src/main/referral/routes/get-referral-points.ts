import { createRoute } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isGroupOwner } from '../../../middlewares/is-group-owner.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { zReferralPoints } from '../referral.schema'
import { findReferralPoints, getReferredPoints } from '../refferal.service'

export const getReferralPointsRoute = createRoute({
    path: '/v1/referral-points',
    method: 'get',
    tags: ['Referral Points'],
    middleware: [checkToken, isGroupOwner] as const,
    responses: {
        [OK]: ApiResponse(zReferralPoints, 'Referral Points Details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Not found!'),
    },
})

export const getReferralPointsHandler: AppRouteHandler<
    typeof getReferralPointsRoute
> = async (c) => {
    const { sub } = c.get('jwtPayload')

    const findReferralDetails = await findReferralPoints(sub)
    const referredPoints = await getReferredPoints(sub)
    const totalPoints =
        Number(findReferralDetails?.points ?? 0) + Number(referredPoints)

    if (!totalPoints) {
        return c.json(
            {
                data: {},
                message: 'No referral point found',
                success: false,
                error: true,
            },
            NOT_FOUND,
        )
    }
    return c.json(
        {
            data: {
                myPoints: {
                    myPoints: findReferralDetails?.points ?? 0,
                    planName: findReferralDetails?.planName,
                },
                referredPoints: referredPoints,
                totalPoints: totalPoints,
            },
            message: 'Referral points',
            success: true,
            error: false,
        },
        OK,
    )
}

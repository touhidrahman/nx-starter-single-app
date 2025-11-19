import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { APP_OPENAPI_TAGS } from '../../../models/common.values'
import { ApiListResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import { zQueryReferrals, zSelectReferral } from '../core/referral-core.model'
import { ReferralCustomService } from './referral-custom.service'

const tags = [APP_OPENAPI_TAGS.Referral]
const path = '/custom/referrals'

const GetMyReferralsCustomDef = createRoute({
    path: `${path}/my`,
    tags,
    method: 'get',
    middleware: [checkToken] as const,
    request: {
        query: zQueryReferrals,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectReferral), 'My Referrals'),
    },
})

const GetMyReferralsCustom: AppRouteHandler<
    typeof GetMyReferralsCustomDef
> = async (c) => {
    const query = c.req.valid('query')
    const { sub: userId } = c.get('jwtPayload') as AccessTokenPayload
    const data = await ReferralCustomService.findManyForUser(query, userId)
    const count = await ReferralCustomService.countForUser(query, userId)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'My referrals fetched successfully',
            success: true,
        },
        OK,
    )
}

export const referralCustomRoutes = createRouter().openapi(
    GetMyReferralsCustomDef,
    GetMyReferralsCustom,
)

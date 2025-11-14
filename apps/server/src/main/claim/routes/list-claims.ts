import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { ApiResponse } from '../../../utils/api-response.util'
import { zSelectClaim } from '../claim.schema'
import { findAllClaims } from '../claim.service'
export const listClaimsRoute = createRoute({
    path: '/v1/claims',
    method: 'get',
    tags: ['Claims'],
    middleware: [checkToken],
    query: z.object({
        search: z.string().optional(),
        orderBy: z.string().optional(),
    }),
    responses: {
        [OK]: ApiResponse(z.array(zSelectClaim), 'List of permission names'),
    },
})

export const listClaimsHandler: AppRouteHandler<
    typeof listClaimsRoute
> = async (c) => {
    const data = findAllClaims()

    return c.json(
        {
            data: data,
            message: 'Claims fetched successfully',
            success: true,
        },
        OK,
    )
}

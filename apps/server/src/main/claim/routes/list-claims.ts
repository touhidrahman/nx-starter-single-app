import { createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import {
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
    OK,
} from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkGroupId } from '../../../core/middlewares/check-groupId.middleware'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmptyList } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { findGroupById } from '../../group/group.service'
import { zSelectClaim } from '../claim.schema'
import { findAllClaimsByGroupType } from '../claim.service'

export const listClaimsRoute = createRoute({
    path: '/v1/claims',
    method: 'get',
    tags: ['Claims'],
    middleware: [checkToken, checkGroupId],
    query: z.object({
        search: z.string().optional(),
        orderBy: z.string().optional(),
    }),
    responses: {
        [OK]: ApiResponse(z.array(zSelectClaim), 'List of permission names'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(
            zEmptyList,
            'Internal server error',
        ),
    },
})

export const listClaimsHandler: AppRouteHandler<
    typeof listClaimsRoute
> = async (c) => {
    const groupId = c.get('groupId')

    if (!groupId) {
        throw new HTTPException(BAD_REQUEST, {
            message: 'Group ID is missing in request context',
        })
    }

    const getGroupByGroupId = await findGroupById(groupId)
    const groupType = getGroupByGroupId?.type as 'client' | 'vendor'

    if (!groupType) {
        throw new HTTPException(BAD_REQUEST, {
            message: 'Group Type is missing in request context',
        })
    }

    try {
        const data = findAllClaimsByGroupType(groupType)

        return c.json({
            data: data,
            message: 'Claims fetched successfully',
            success: true,
        })
    } catch (error) {
        return c.json(
            {
                data: [],
                message: 'Internal server error',
                success: false,
                error,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}

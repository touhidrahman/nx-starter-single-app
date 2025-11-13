import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectGroup } from '../group.schema'
import { getAllGroupsByUserId } from '../group.service'

export const getMyGroupsRoute = createRoute({
    path: '/v1/groups/my-groups',
    tags: ['Group'],
    method: 'get',
    middleware: [checkToken] as const,
    responses: {
        [OK]: ApiResponse(
            z.array(
                zSelectGroup.extend({
                    membership: z.enum(['owner', 'member']),
                }),
            ),
            'List of Groups',
        ),
    },
})

export const getMyGroupsHandler: AppRouteHandler<
    typeof getMyGroupsRoute
> = async (c) => {
    const { sub } = await c.get('jwtPayload')

    const groupsMemberOf = await getAllGroupsByUserId(sub)
    const myGroups = groupsMemberOf
        .map((g) => ({
            ...g,
            membership: (g.creatorId === sub ? 'owner' : 'member') as
                | 'owner'
                | 'member',
        }))
        .sort((a) => (a.membership === 'owner' ? -1 : 1))

    return c.json(
        {
            data: myGroups,
            message: 'Owned group list',
            success: true,
        },
        OK,
    )
}

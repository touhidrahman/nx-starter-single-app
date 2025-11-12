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
            z.object({
                groups: z.array(
                    zSelectGroup.extend({
                        membership: z.enum(['owner', 'member']),
                    }),
                ),
                hasVendorGroup: z.boolean(),
                hasClientGroup: z.boolean(),
            }),
            'List of Groups',
        ),
    },
})

export const getMyGroupsHandler: AppRouteHandler<
    typeof getMyGroupsRoute
> = async (c) => {
    const { sub, groupId } = await c.get('jwtPayload')

    const groupsMemberOf = await getAllGroupsByUserId(sub)
    const myGroups = groupsMemberOf
        .map((g) => ({
            ...g,
            membership: (g.ownerId === sub ? 'owner' : 'member') as
                | 'owner'
                | 'member',
        }))
        .sort((a) => (a.membership === 'owner' ? -1 : 1))
    const ownedGroups = groupsMemberOf.filter((g) => g.ownerId === sub)

    const hasVendorGroup = ownedGroups.some((g) => g.type === 'vendor')
    const hasClientGroup = ownedGroups.some((g) => g.type === 'client')

    return c.json(
        {
            data: {
                groups: myGroups,
                hasVendorGroup,
                hasClientGroup,
            },
            message: 'Owned group list',
            success: true,
        },
        OK,
    )
}

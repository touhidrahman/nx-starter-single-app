import { createRoute, z } from '@hono/zod-openapi'
import {
    FORBIDDEN,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    OK,
} from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectGroup } from '../../group/group.schema'
import { findGroupById, findMembership } from '../../group/group.service'
import { zSelectRole } from '../../role/role.schema'
import { findRoleById } from '../../role/role.service'
import { zSelectUserWithoutPass } from '../../user/user.schema'
import { findUserById, setDefaultGroupId } from '../auth.service'
import { createAccessToken, createRefreshToken } from '../token.util'

export const groupSwitchRoute = createRoute({
    path: '/v1/group-switch/:groupId',
    method: 'post',
    tags: ['Group'],
    middleware: [checkToken] as const,
    request: {
        params: z.object({ groupId: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(
            z.object({
                accessToken: z.string(),
                refreshToken: z.string(),
                user: zSelectUserWithoutPass,
                role: zSelectRole.optional(),
                group: zSelectGroup.optional(),
            }),
            'Group switched successfully',
        ),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Invalid group data'),
        [FORBIDDEN]: ApiResponse(zEmpty, 'Not a member'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})
export const groupSwitchHandler: AppRouteHandler<
    typeof groupSwitchRoute
> = async (c) => {
    const { sub } = await c.get('jwtPayload')
    const groupId = c.req.param('groupId') ?? ''

    const user = await findUserById(sub)
    const group = await findGroupById(groupId)

    if (!group) {
        return c.json(
            {
                data: {},
                success: false,
                message: "You don't have group, please create one",
            },
            NOT_FOUND,
        )
    }

    const membership = await findMembership(group.id, sub)

    if (!membership) {
        return c.json(
            {
                message: 'You are not a member of the organization',
                data: {},
                success: false,
            },
            FORBIDDEN,
        )
    }

    await setDefaultGroupId(user.id, group.id)

    const [role] = await findRoleById(membership.roleId ?? '')

    const accessToken = await createAccessToken(
        user,
        membership.roleId ?? '',
        group,
    )
    const refreshToken = await createRefreshToken(user.id, group.id)

    return c.json(
        {
            data: {
                accessToken,
                refreshToken,
                user: user,
                role: role ?? undefined,
                group: group ?? undefined,
            },
            success: true,
            message: 'Group switched successfully!',
        },
        OK,
    )
}

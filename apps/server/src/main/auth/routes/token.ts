import { createRoute } from '@hono/zod-openapi'
import { BAD_REQUEST, OK } from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { z } from 'zod'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { DateUtil } from '../../../core/utils/date.util'
import { findAdminById } from '../../admin/admin-user.service'
import { SelectGroup, zSelectGroup } from '../../group/group.schema'
import { SelectRole, zSelectRole } from '../../role/role.schema'
import { zSelectUserWithoutPass } from '../../user/user.schema'
import { TokenContext, zAdminPayload } from '../auth.schema'
import {
    buildAdminPayload,
    buildUserContext,
    isExpiringInDays,
} from '../auth.service'
import {
    ACCESS_TOKEN_LIFE,
    createAccessToken,
    createAdminAccessToken,
    createAdminRefreshToken,
    createRefreshToken,
    decodeRefreshToken,
} from '../token.util'

const tags = ['Auth']

export const getTokenRoute = createRoute({
    path: '/v1/auth/token',
    method: 'post',
    tags,
    middleware: [checkToken] as const,
    request: {
        body: jsonContentRequired(
            z.object({ refreshToken: z.string() }),
            'Refresh token',
        ),
    },
    responses: {
        [OK]: ApiResponse(
            z.object({
                accessToken: z.string(),
                refreshToken: z.string(),
                lastLogin: z.string(),
                expiresIn: z.string(),
                user: z.union([zSelectUserWithoutPass, zAdminPayload]),
                group: zSelectGroup.optional(),
                role: zSelectRole.optional(),
            }),
            'New token generated',
        ),

        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid refresh token'),
    },
})

export const getTokenRouteHandler: AppRouteHandler<
    typeof getTokenRoute
> = async (c) => {
    const { refreshToken: incomingRefreshToken } = c.req.valid('json')
    const decoded = await decodeRefreshToken(incomingRefreshToken)
    if (!decoded) {
        return c.json(
            {
                message: 'Invalid or expired refresh token',
                data: {},
                success: false,
            },
            BAD_REQUEST,
        )
    }

    const { sub, level, groupId, exp } = decoded
    const now = DateUtil.date()
    const expiresSoon = isExpiringInDays(exp, -1)

    let refreshToken: string
    let accessToken: string
    let userData:
        | ReturnType<typeof zSelectUserWithoutPass.parse>
        | ReturnType<typeof buildAdminPayload>
    let group: SelectGroup | undefined
    let role: SelectRole | undefined

    if (level === 'admin') {
        const admin = await findAdminById(sub)
        if (!admin) {
            return c.json(
                { message: 'Admin not found', data: {}, success: false },
                BAD_REQUEST,
            )
        }

        refreshToken = expiresSoon
            ? await createAdminRefreshToken(admin)
            : incomingRefreshToken

        accessToken = await createAdminAccessToken(admin)
        userData = buildAdminPayload(admin)
    } else {
        const {
            user,
            group: userGroup,
            role: userRole,
        } = await buildUserContext(sub, groupId)

        if (!user) {
            return c.json(
                { message: 'User not found', data: {}, success: false },
                BAD_REQUEST,
            )
        }

        if (!userGroup) {
            return c.json(
                {
                    message: 'User is not a member of any group',
                    data: {},
                    success: false,
                },
                BAD_REQUEST,
            )
        }

        refreshToken = expiresSoon
            ? await createRefreshToken(user.id, userGroup.id)
            : incomingRefreshToken

        accessToken = await createAccessToken(
            user,
            userRole?.id ?? '',
            userGroup,
        )

        userData = zSelectUserWithoutPass.parse(user)
        group = userGroup
        role = userRole
    }

    const context: TokenContext = {}
    if (group) context.group = group
    if (role) context.role = role

    return c.json(
        {
            message: 'Token verification successful',
            data: {
                accessToken,
                refreshToken,
                lastLogin: now.toISOString(),
                expiresIn: DateUtil.addSeconds(
                    now,
                    ACCESS_TOKEN_LIFE,
                ).toISOString(),
                user: userData,
                group,
                role,
            },
            success: true,
        },
        OK,
    )
}

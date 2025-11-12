import { createRoute } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    CONFLICT,
    CREATED,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
} from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { findGroupById } from '../../group/group.service'
import {
    checkGroupLimit,
    deleteInvitation,
    findInvitationById,
} from '../../invite/invite.service'
import { setDefaultGroupId } from '../../user/user.service'
import { zAcceptInvite, zSelectAuthUser } from '../auth.schema'
import { addUserToGroup, createUser, findUserByEmail } from '../auth.service'
import { decodeInvitationToken } from '../token.util'

const tags = ['Auth']

export const acceptInviteRoute = createRoute({
    path: '/v1/auth/accept-invite',
    method: 'post',
    tags,
    request: {
        body: jsonContentRequired(zAcceptInvite, 'User registration details'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectAuthUser, 'User registration successful'),
        [CONFLICT]: ApiResponse(zEmpty, 'Email already exists'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User not found'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid data'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const acceptInviteHandler: AppRouteHandler<
    typeof acceptInviteRoute
> = async (c) => {
    const payload = c.req.valid('json')
    const { token, password, firstName, lastName, username } = payload

    const decoded = await decodeInvitationToken(token)

    if (!decoded) {
        return c.json(
            {
                data: {},
                message: 'Invalid token!',
                success: false,
            },
            BAD_REQUEST,
        )
    }

    const invite = await findInvitationById(decoded.invitationId)
    if (!invite) {
        return c.json(
            {
                data: {},
                message: 'Invitation not found!',
                success: false,
            },
            BAD_REQUEST,
        )
    }

    const group = await findGroupById(decoded.organizationId)
    if (!group) {
        return c.json(
            {
                data: {},
                message: 'Organization not found!',
                success: false,
            },
            NOT_FOUND,
        )
    }

    const limitCheck = await checkGroupLimit(decoded.organizationId, {
        countSource: 'users',
    })

    if (!limitCheck.canAdd) {
        return c.json(
            {
                data: { redirect: false, url: '' },
                message: limitCheck.message || 'User limit reached',
                error: limitCheck.message,
                success: false,
            },
            BAD_REQUEST,
        )
    }

    let user = await findUserByEmail(decoded.userEmail)
    if (user) {
        return c.json(
            {
                data: {},
                message: 'User already exists',
                success: false,
            },
            BAD_REQUEST,
        )
    }
    user = await createUser({
        email: decoded.userEmail,
        username,
        password,
        firstName,
        lastName,
    })

    await addUserToGroup(user.id, decoded.organizationId, decoded.roleId)
    await setDefaultGroupId(user.id, decoded.organizationId)
    await deleteInvitation(decoded.invitationId)

    return c.json(
        {
            data: user,
            message: 'Account created',
            success: true,
            error: null,
            meta: null,
        },
        CREATED,
    )
}

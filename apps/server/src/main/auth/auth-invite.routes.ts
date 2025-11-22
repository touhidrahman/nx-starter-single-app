import { createRoute } from '@hono/zod-openapi'
import { eq } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'
import { BAD_REQUEST, OK } from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../core/core.type'
import { createRouter } from '../../core/create-app'
import { db } from '../../db/db'
import { membershipsTable } from '../../db/schema'
import { REQ_METHOD } from '../../models/common.values'
import { ApiResponse } from '../../utils/api-response.util'
import { addUserToGroup, findGroupById } from '../group/group.service'
import { InviteCustomService } from '../invite/custom/invite-custom.service'
import { UserCrudService } from '../user/crud/user-crud.service'
import { UserCustomService } from '../user/custom/user-custom.service'
import { setDefaultGroupId } from '../user/user.service'
import { AuthService } from './auth.service'
import { zAcceptInvite, zUserLoginResponse } from './auth.zod'
import { decodeInvitationToken } from './token.util'

const tags = ['Auth']
const path = '/auth'

const AcceptInviteDef = createRoute({
    path: `${path}/accept-invite`,
    tags,
    method: REQ_METHOD.POST,
    request: {
        body: jsonContentRequired(zAcceptInvite, 'Accept Invite Data'),
    },
    responses: {
        [OK]: ApiResponse(zUserLoginResponse, 'User logged in successfully'),
    },
})

const AcceptInvite: AppRouteHandler<typeof AcceptInviteDef> = async (c) => {
    const payload = c.req.valid('json')
    const { token, password, firstName, lastName, username } = payload

    const decoded = await decodeInvitationToken(token)

    if (!decoded) {
        throw new HTTPException(BAD_REQUEST, {
            message: 'Invalid token!',
        })
    }

    const invite = await InviteCustomService.findById(decoded.invitationId)
    if (!invite) {
        throw new HTTPException(BAD_REQUEST, {
            message: 'Invitation not found!',
        })
    }

    const group = await findGroupById(decoded.organizationId)
    if (!group) {
        throw new HTTPException(BAD_REQUEST, {
            message: 'Organization not found!',
        })
    }

    const existsUsername = await UserCustomService.findOne({
        username: username,
    })
    const existsEmail = await UserCustomService.findOne({
        email: invite.email,
    })
    const exists = existsUsername || existsEmail
    if (exists) {
        throw new HTTPException(BAD_REQUEST, {
            message: 'User with the given username or email already exists',
        })
    }

    const user = await UserCrudService.create({
        username,
        password,
        firstName,
        lastName,
        email: invite.email,
    })

    await addUserToGroup(user.id, decoded.organizationId, decoded.roleId)
    await setDefaultGroupId(user.id, decoded.organizationId)
    await InviteCustomService.delete(decoded.invitationId)
    const role = await db.query.membershipsTable.findFirst({
        with: { role: true },
        where: eq(membershipsTable.userId, user.id),
    })

    const data = await AuthService.getUserLoginResponse(
        user,
        group,
        role?.role ?? null,
    )

    return c.json(
        {
            data,
            message: 'User registered successfully',
            success: true,
        },
        OK,
    )
}

export const authInviteRoutes = createRouter().openapi(
    AcceptInviteDef,
    AcceptInvite,
)

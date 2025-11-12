import { createRoute, z } from '@hono/zod-openapi'
import { BAD_REQUEST, CREATED } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { groupTypeEnum } from '../../../core/db/schema'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { getAllAdmins } from '../../admin/admin-user.service'
import { zInsertGroup, zSelectGroup } from '../../group/group.schema'
import {
    createGroup,
    findOwnedGroupByType,
    setDefaultGroup,
} from '../../group/group.service'
import { findUserById } from '../../user/user.service'
import {
    sendProfileCreatedEmail,
    sendUpdateStatusEmailToAdmin,
    subscribeToFreePlan,
} from '../auth.service'

export const createProfileRoute = createRoute({
    path: '/v1/create-profile/:type',
    method: 'post',
    tags: ['Auth'],
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(zInsertGroup, 'Group create input'),
        params: z.object({ type: z.enum(['client', 'vendor']) }),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectGroup, 'Vendor profile created'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid input'),
    },
})

/**
 * Create a group for the authenticated user. Type of groups: 'client' or 'vendor'.
 * One user can create at most one group per type (but may be member of multiple groups).
 * He will be the owner of the group.
 */
export const createProfileHandler: AppRouteHandler<
    typeof createProfileRoute
> = async (c) => {
    const body = c.req.valid('json')
    const { sub: userId } = await c.get('jwtPayload')
    const { type } = c.req.valid('param')

    const user = await findUserById(userId)
    if (!user) {
        return c.json(
            { success: false, message: 'User not found', data: {} },
            BAD_REQUEST,
        )
    }

    const ownedGroupByType = await findOwnedGroupByType(user.id, type)

    if (ownedGroupByType) {
        return c.json(
            {
                success: false,
                message: `You already have a ${type} organization which you own.
                 Cannot create another one.`,
                data: {},
            },
            BAD_REQUEST,
        )
    }

    const [group] = await createGroup({
        ...body,
        ownerId: user.id,
        name: body.name ?? `${user.firstName} ${user.lastName}'s Organization`,
        type,
        email: body.email ?? user.email,
    })

    const [client, vendor] = groupTypeEnum.enumValues

    // If Group Type is Vendor/Lawyer, assign group to free plan
    if (type === vendor) {
        const { success, message } = await subscribeToFreePlan(group.id)
        if (!success) {
            c.var.logger.warn(
                `Failed to subscribe group ${group.id} to free plan: ${message}`,
            )
        }
    }

    // update user with default group id
    await setDefaultGroup(user.id, group.id)

    await sendProfileCreatedEmail(user, group)

    // send an email to super admin to update the status of user
    const { data: admins } = await getAllAdmins({ page: 1, size: 100 })
    const adminEmails = admins.map((admin) => admin.email)
    await sendUpdateStatusEmailToAdmin(user, group, adminEmails)

    return c.json(
        {
            data: group,
            success: true,
            message: `${type} profile created`,
        },
        CREATED,
    )
}

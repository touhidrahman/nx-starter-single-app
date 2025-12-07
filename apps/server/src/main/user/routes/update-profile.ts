import { createRoute } from '@hono/zod-openapi'
import { FORBIDDEN, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'

import { zProfile, zSelectUser } from '../user.schema'
import { updateProfile } from '../user.service'
import { passwordRemoved } from '../user.util'

export const updateUserProfileRoute = createRoute({
    path: '/user/profile',
    method: 'patch',
    tags: ['User'],
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(zProfile, 'Profile details to update'),
    },
    responses: {
        [OK]: ApiResponse(zSelectUser, 'Profile updated'),
        [FORBIDDEN]: ApiResponse(zEmpty, 'Unauthorized to update profile'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User not found'),
    },
})

export const updateUserProfileHandler: AppRouteHandler<typeof updateUserProfileRoute> = async (
    c,
) => {
    const body = c.req.valid('json')
    const userPayload = await c.get('jwtPayload')
    const userId = userPayload?.sub

    if (!userId) {
        return c.json(
            {
                success: false,
                message: 'Unauthorized to update profile',
                data: {},
            },
            FORBIDDEN,
        )
    }

    // Call the services to update user
    const [updatedUser] = await updateProfile(userId, body, {
        restrictFields: ['email', 'password'],
    })

    if (!updatedUser) {
        return c.json({ success: false, message: 'User not found', data: {} }, NOT_FOUND)
    }

    return c.json(
        {
            success: true,
            message: 'Profile updated successfully',
            data: passwordRemoved(updatedUser),
        },
        OK,
    )
}

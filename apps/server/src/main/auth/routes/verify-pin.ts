import { createRoute, z } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { findUserById } from '../../user/user.service'
import { findUserSettingsByUserId } from '../../user-settings/user-setting.service'

export const verifyPinRoute = createRoute({
    path: '/auth/verify-pin',
    method: 'post',
    tags: ['User Settings'],
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(z.object({ pin: z.string() }), 'Pin code'),
    },
    responses: {
        [OK]: ApiResponse(
            z.object({ verified: z.boolean() }),
            'User verification',
        ),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User not found'),
    },
})

export const verifyPinHandler: AppRouteHandler<typeof verifyPinRoute> = async (
    c,
) => {
    const payload = c.get('jwtPayload')
    const { pin } = c.req.valid('json')

    const user = await findUserById(payload.sub)
    if (!user) {
        return c.json(
            {
                data: {},
                message: 'User Setting not found',
                success: false,
                error: null,
                meta: null,
            },
            NOT_FOUND,
        )
    }

    const userSetting = await findUserSettingsByUserId(user.id)

    const settingsObject = userSetting?.reduce((acc, curr) => {
        acc[curr.key] = curr.value
        return acc
    }, {})

    if (settingsObject?.pinCode !== pin) {
        return c.json(
            {
                data: { verified: false },
                message: "Pin didn't matched!",
                success: false,
                error: null,
                meta: null,
            },
            NOT_FOUND,
        )
    }
    return c.json(
        {
            data: { verified: true },
            message: 'Success!',
            success: true,
            error: null,
            meta: null,
        },
        OK,
    )
}

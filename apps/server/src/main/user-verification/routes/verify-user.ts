import { createRoute, z } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    OK,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { verifyUser } from '../../auth/auth.service'
import { decodeGeneralToken } from '../../auth/token.util'
import {
    zSelectUserVerification,
    zUpdateUserVerification,
} from '../user-verification.schema'
import { findVerificationByPhone } from '../user-verification.service'

export const userVerificationRoute = createRoute({
    path: '/v1/verify-phone/:token',
    method: 'post',
    tags: ['User Verification'],
    request: {
        params: z.object({ token: z.string() }),
        body: jsonContent(zUpdateUserVerification, 'verification code details'),
    },
    responses: {
        [OK]: ApiResponse(
            zSelectUserVerification,
            'verification  successfully',
        ),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid verification data'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'verification not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const userVerificationHandler: AppRouteHandler<
    typeof userVerificationRoute
> = async (c) => {
    const { token } = c.req.valid('param')
    const { verificationCode } = c.req.valid('json')
    const decoded = await decodeGeneralToken(token)
    const numberVerificationCode = Number(verificationCode)

    const existingVerificationCode = await findVerificationByPhone(
        decoded?.sub ?? '',
    )
    const existNumberVerificationCode = Number(
        existingVerificationCode?.verificationCode ?? 0,
    )

    try {
        if (!existingVerificationCode) {
            return c.json(
                { data: {}, message: 'Item not found', success: false },
                NOT_FOUND,
            )
        }

        if (numberVerificationCode !== existNumberVerificationCode) {
            return c.json(
                {
                    data: {},
                    message: 'Code is not correct',
                    success: false,
                },
                NOT_FOUND,
            )
        }

        if (existNumberVerificationCode === numberVerificationCode) {
            await verifyUser(decoded?.sub ?? '')
        }

        return c.json(
            {
                data: { status: 'verified' } as any,
                message: 'User verified',
                success: true,
            },
            OK,
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json(
                {
                    data: {},
                    message: 'Bad request',
                    success: false,
                    error: error.issues,
                },
                BAD_REQUEST,
            )
        }
        c.var.logger.error((error as Error)?.stack ?? error)
        return c.json(
            { data: {}, message: 'Internal Server Error', success: false },
            INTERNAL_SERVER_ERROR,
        )
    }
}

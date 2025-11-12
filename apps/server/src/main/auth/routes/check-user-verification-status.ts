import { createRoute } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
    OK,
} from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zUserIdentifier, zUserVerificationStatus } from '../auth.schema'
import {
    findUnverifiedUserByPhoneEmail,
    findVerifiedUserByPhoneEmail,
    validateIdentifier,
} from '../auth.service'

const tags = ['Auth']

export const checkUserVerificationStatusRoute = createRoute({
    path: '/v1/check-user-verification-status',
    method: 'post',
    tags,
    request: {
        body: jsonContentRequired(
            zUserIdentifier,
            'Check phone status request',
        ),
    },
    responses: {
        [OK]: ApiResponse(
            zUserVerificationStatus,
            'Phone status checked successfully',
        ),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid phone number'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(
            zEmpty,
            'Failed to check phone status',
        ),
    },
})

export const checkUserVerificationStatusHandler: AppRouteHandler<
    typeof checkUserVerificationStatusRoute
> = async (c) => {
    try {
        const { identifier } = c.req.valid('json')
        const identifierResult = validateIdentifier(identifier ?? '')
        const isEmail = identifierResult.type === 'email'
        const trimIdentifier = identifier.trim()

        if (identifierResult.isValid === false) {
            return c.json(
                {
                    success: false,
                    message: 'Invalid phone number or email',
                    data: {},
                    error: 'Invalid phone number or email',
                    meta: null,
                },
                BAD_REQUEST,
            )
        }

        const verifiedUser = await findVerifiedUserByPhoneEmail(
            trimIdentifier,
            isEmail,
        )
        if (verifiedUser) {
            return c.json(
                {
                    success: true,
                    message: `${isEmail ? 'Email' : 'Phone'} Exists and verified`,
                    data: {
                        exists: true,
                        isVerified: true,
                        canVerify: false,
                        isEmail: isEmail,
                    },
                    error: null,
                    meta: null,
                },
                OK,
            )
        }

        const unverifiedUser = await findUnverifiedUserByPhoneEmail(
            trimIdentifier,
            isEmail,
        )

        return c.json(
            {
                success: true,
                message: `${isEmail ? 'Email' : 'Phone'} Exists and Unverified`,
                data: {
                    exists: !!unverifiedUser,
                    isVerified: false,
                    canVerify: !!unverifiedUser,
                    isEmail: isEmail,
                },
                error: null,
                meta: null,
            },
            OK,
        )
    } catch (e) {
        c.var.logger.error('Failed to check phone status', e)
        return c.json(
            {
                success: false,
                message: 'Failed to check phone status',
                data: {},
                error: 'Failed to check phone status',
                meta: null,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}

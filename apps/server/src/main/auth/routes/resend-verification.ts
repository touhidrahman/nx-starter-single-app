import { createRoute, z } from '@hono/zod-openapi'
import { random } from 'radash'
import {
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    OK,
    TOO_MANY_REQUESTS,
} from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { USER_VERIFICATION_TYPE_VALUES } from '../../user-verification/user-verification.schema'
import {
    findUserVerificationById,
    updateOnlyVerificationCode,
} from '../../user-verification/user-verification.service'
import {
    findUnverifiedUserByPhoneEmail,
    resendVerificationEmail,
    sendVerificationCodeMsg,
    validateCountdown,
    validateIdentifier,
} from '../auth.service'
import { createGeneralToken } from '../token.util'

const tags = ['Auth']

export const resendVerificationRoute = createRoute({
    path: '/v1/resend-verification',
    method: 'post',
    tags,
    request: {
        body: jsonContentRequired(
            z.object({
                identifier: z
                    .string()
                    .max(100, 'Phone number or Email is required'),
            }),
            'Send phone verification request',
        ),
    },
    responses: {
        [OK]: ApiResponse(
            z.object({
                token: z.string(),
                isEmail: z.boolean(),
            }),
            'Verification mail / code sent successfully',
        ),
        [BAD_REQUEST]: ApiResponse(
            zEmpty,
            ' Phone number or Email already verified',
        ),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Unverified user not found'),
        [TOO_MANY_REQUESTS]: ApiResponse(
            zEmpty,
            'Please wait before requesting another verification code',
        ),
        [INTERNAL_SERVER_ERROR]: ApiResponse(
            zEmpty,
            'Failed to send verification mail / code',
        ),
    },
})

export const resendVerificationHandler: AppRouteHandler<
    typeof resendVerificationRoute
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
                },
                BAD_REQUEST,
            )
        }

        const unverifiedUser = await findUnverifiedUserByPhoneEmail(
            trimIdentifier,
            isEmail,
        )
        if (!unverifiedUser) {
            return c.json(
                {
                    success: false,
                    message: 'Unverified user not found',
                    data: {},
                },
                NOT_FOUND,
            )
        }

        if (isEmail) {
            const { error, data } = await resendVerificationEmail(
                unverifiedUser?.email ?? '',
                unverifiedUser?.firstName,
                unverifiedUser?.lastName,
                unverifiedUser?.id,
            )
            if (error) {
                return c.json(
                    {
                        success: false,
                        message: 'Failed to send email verification mail',
                        data: {},
                    },
                    INTERNAL_SERVER_ERROR,
                )
            }
        }

        let token = ''

        if (!isEmail) {
            const userVerificationDetails = await findUserVerificationById(
                unverifiedUser?.id ?? '',
                trimIdentifier,
                USER_VERIFICATION_TYPE_VALUES.registration,
            )

            if (userVerificationDetails?.createdAt) {
                const countdownCheck = validateCountdown(
                    userVerificationDetails.createdAt,
                )
                if (!countdownCheck.allowed) {
                    return c.json(
                        {
                            success: false,
                            message: `${countdownCheck.message}`,
                            data: {},
                        },
                        TOO_MANY_REQUESTS,
                    )
                }
            }

            const verificationCode = random(100000, 999999)
            const expiresIn = 20 * 60
            const expiresNewDateTime = new Date(Date.now() + expiresIn * 1000)
            await updateOnlyVerificationCode(
                userVerificationDetails?.id ?? '',
                verificationCode,
                expiresNewDateTime,
            )
            const message = `Your MyApp verification code is: ${verificationCode}.`
            const { error } = await sendVerificationCodeMsg(
                message,
                trimIdentifier,
            )

            token = await createGeneralToken(trimIdentifier, expiresIn)

            if (error) {
                c.var.logger.error('Failed to send verification email')
            }
        }

        return c.json(
            {
                success: true,
                message: 'Verification code sent successfully',
                data: {
                    token: isEmail ? '' : token,
                    isEmail: isEmail,
                },
            },
            OK,
        )
    } catch (e) {
        c.var.logger.error('Failed to send verification code')
        return c.json(
            {
                success: false,
                message: 'Failed to send verification code',
                data: {},
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}

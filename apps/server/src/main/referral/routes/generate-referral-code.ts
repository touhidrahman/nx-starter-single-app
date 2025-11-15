import { createRoute } from '@hono/zod-openapi'
import * as radash from 'radash'
import { CREATED } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isGroupOwner } from '../../../middlewares/is-group-owner.middleware'
import { ApiResponse } from '../../../utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { findGroupById } from '../../group/group.service'
import { zSelectReferralCode } from '../referral.schema'
import {
    createRefCode,
    findReferralCode,
    updateReferralCode,
} from '../refferal.service'

export const generateReferralCodeRoute = createRoute({
    path: '/referral-code/generate',
    method: 'post',
    tags: ['Referral Code'],
    middleware: [checkToken, isGroupOwner] as const,
    request: {},
    responses: {
        [CREATED]: ApiResponse(
            zSelectReferralCode,
            'Referral code generated successfully',
        ),
    },
})

export const generateReferralCodeHandler: AppRouteHandler<
    typeof generateReferralCodeRoute
> = async (c) => {
    const { groupId, sub } = c.get('jwtPayload')

    const findCode = await findReferralCode(sub)

    const group = await findGroupById(groupId)

    const input = group?.name || ''
    const firstThree = input.slice(0, 3).toUpperCase()
    const lastThree = input.slice(-3).toUpperCase()
    const digits = radash.random(100, 999)
    const code = `${firstThree}${digits}${lastThree}`

    const data = {
        userId: sub,
        groupId,
        referralCode: code,
    }

    if (findCode) {
        const [updatedEntry] = await updateReferralCode(
            findCode.referralCode,
            findCode.id,
        )

        return c.json(
            {
                data: updatedEntry,
                message: 'Successfully generated referral code',
                success: true,
                error: false,
            },
            CREATED,
        )
    }
    const [entry] = await createRefCode(data)

    await saveLog('referrals', entry.id, sub, 'create', {}, toJsonSafe(entry))

    return c.json(
        {
            data: entry,
            message: 'Successfully generated referral code',
            success: true,
            error: false,
        },
        CREATED,
    )
}

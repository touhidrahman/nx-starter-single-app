import { Context, Next } from 'hono'
import { FORBIDDEN } from 'stoker/http-status-codes'
import { DateUtil } from '../utils/date.util'

export const isUserBanned = async (ctx: Context, next: Next) => {
    const payload = ctx.get('jwtPayload')
    if (DateUtil.date(payload.bannedAt)) {
        return ctx.json(
            {
                error: 'Unauthorized',
                message: 'User is banned',
                data: {},
                success: false,
            },
            FORBIDDEN,
        )
    }

    return next()
}

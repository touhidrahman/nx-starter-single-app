import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { FORBIDDEN } from 'stoker/http-status-codes'
import { SystemUserLevel } from '../core.type'

export const isLevel =
    (type: SystemUserLevel) => async (ctx: Context, next: Next) => {
        const payload = ctx.get('jwtPayload')
        if (payload.type !== type) {
            throw new HTTPException(FORBIDDEN, {
                message: 'Not a priviledged user',
            })
        }

        await next()
    }

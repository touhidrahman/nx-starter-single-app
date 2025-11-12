import { Context, Next } from 'hono'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { FORBIDDEN } from 'stoker/http-status-codes'
import { SystemUserLevel } from '../core.type'

export const isAdmin = createMiddleware(async (ctx: Context, next: Next) => {
    const payload = ctx.get('jwtPayload')

    if (payload.level !== SystemUserLevel.ADMIN) {
        throw new HTTPException(FORBIDDEN, { message: 'Not an admin' })
    }

    await next()
})

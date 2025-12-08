import { Context, Next } from 'hono'
import { FORBIDDEN } from 'stoker/http-status-codes'

export const checkLevel = (allowedLevels: string[]) => async (ctx: Context, next: Next) => {
    const payload = ctx.get('jwtPayload')

    if (!allowedLevels.includes(payload.level)) {
        return ctx.json({ message: 'Forbidden: Insufficient permissions' }, FORBIDDEN)
    }
    return next()
}

import { Context, Next } from 'hono'
import { FORBIDDEN } from 'stoker/http-status-codes'
import { isParticipant } from '../../main/group/group.service'

export const isGroupParticipant = async (ctx: Context, next: Next) => {
    const payload = await ctx.get('jwtPayload')
    if (!payload?.groupId || !payload?.sub)
        return ctx.json(
            {
                data: {},
                error: 'Unauthorized',
                message: 'Not a group participant',
            },
            FORBIDDEN,
        )
    const id = ctx.req.param('id') ?? payload?.groupId
    const exists = await isParticipant(payload?.sub, id)

    if (!exists) {
        return ctx.json(
            {
                data: {},
                error: 'Unauthorized',
                message: 'Not a group participant',
            },
            FORBIDDEN,
        )
    }

    return next()
}

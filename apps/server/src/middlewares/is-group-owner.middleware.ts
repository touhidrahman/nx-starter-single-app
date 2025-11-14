import { Context, Next } from 'hono'
import { FORBIDDEN } from 'stoker/http-status-codes'
import { isOwner } from '../main/group/group.service'

export const isGroupOwner = async (ctx: Context, next: Next) => {
    const { groupId, sub } = await ctx.get('jwtPayload')
    if (!groupId)
        return ctx.json(
            { data: {}, error: 'Unauthorized', message: 'Not a group owner' },
            FORBIDDEN,
        )

    const exists = await isOwner(sub, groupId)

    if (!exists) {
        return ctx.json(
            { data: {}, error: 'Unauthorized', message: 'Not a group owner' },
            FORBIDDEN,
        )
    }

    return next()
}

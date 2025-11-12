import { MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { NOT_FOUND } from 'stoker/http-status-codes'

export const checkGroupId: MiddlewareHandler = async (c, next) => {
    const payload = c.get('jwtPayload')
    const groupId =
        payload?.groupId || c.req.param('groupId') || c.req.query('groupId')

    if (!groupId) {
        throw new HTTPException(NOT_FOUND, { message: 'Group ID not found!' })
    }

    c.set('groupId', groupId)

    await next()
}

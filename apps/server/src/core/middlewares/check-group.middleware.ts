import { MiddlewareHandler } from 'hono'
import { BAD_REQUEST, NOT_FOUND } from 'stoker/http-status-codes'
import { findGroupById } from '../../main/group/group.service'

export function checkGroupParam(paramName = 'groupId'): MiddlewareHandler {
    return async (c, next) => {
        const pathParam = c.req.param(paramName)
        const queryParam = c.req.query(paramName)

        const groupId = pathParam || queryParam

        if (!groupId || groupId.trim() === '') {
            return c.json(
                {
                    data: {},
                    message: `${paramName} is missing or empty`,
                    success: false,
                },
                BAD_REQUEST,
            )
        }

        const exists = await findGroupById(groupId)
        if (!exists) {
            return c.json(
                {
                    data: {},
                    message: `${paramName} not found in the database`,
                    success: false,
                },
                NOT_FOUND,
            )
        }

        // set in context for next handlers
        c.set(paramName, groupId)
        await next()
    }
}

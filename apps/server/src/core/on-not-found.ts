import { NotFoundHandler } from 'hono'
import { NOT_FOUND } from 'stoker/http-status-codes'

export const notFoundFn: NotFoundHandler = (c) => {
    return c.json(
        {
            success: false,
            error: 'Not Found',
            data: {},
            message: `Not Found - ${c.req.path}`,
        },
        NOT_FOUND,
    )
}

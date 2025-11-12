import { ErrorHandler } from 'hono'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import { INTERNAL_SERVER_ERROR, OK } from 'stoker/http-status-codes'

export function onErrorFn(): ErrorHandler {
    return async (err, c) => {
        const currentStatus =
            'status' in err ? err.status : c.newResponse(null).status
        const statusCode =
            currentStatus !== OK
                ? (currentStatus as ContentfulStatusCode)
                : INTERNAL_SERVER_ERROR
        const env = c.env?.NODE_ENV || process.env?.NODE_ENV

        if (env !== 'production') {
            console.error('Error occurred:', err)
        }

        return c.json(
            {
                data: null,
                error: env === 'production' ? undefined : err.stack,
                message: err.message,
                success: false,
            },
            statusCode,
        )
    }
}

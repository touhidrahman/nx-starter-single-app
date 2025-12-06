import { HTTPException } from 'hono/http-exception'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import { INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'

export function throwHttpError(error: unknown, defaultMessage: string): never {
    throw new HTTPException(
        error instanceof Error
            ? (error.cause as ContentfulStatusCode)
            : INTERNAL_SERVER_ERROR,
        {
            message: (error as Error).message ?? defaultMessage,
        },
    )
}

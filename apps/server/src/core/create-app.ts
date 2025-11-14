import { OpenAPIHono } from '@hono/zod-openapi'
import { compress } from 'hono/compress'
import { cors } from 'hono/cors'
import { poweredBy } from 'hono/powered-by'
import { requestId } from 'hono/request-id'
import { secureHeaders } from 'hono/secure-headers'
import { trimTrailingSlash } from 'hono/trailing-slash'
import { serveEmojiFavicon } from 'stoker/middlewares'
import { defaultHook } from 'stoker/openapi'
import { AppBindings } from './core.type'
import { onErrorFn } from './on-error'
import { notFoundFn } from './on-not-found'
import { customLogger } from './pino-logger.middleware'

export function createRouter() {
    return new OpenAPIHono<AppBindings>({ strict: false, defaultHook })
}

export default function createApp() {
    const app = createRouter()

    app.use('*', requestId())
    app.use(serveEmojiFavicon('🚀'))
    app.use(trimTrailingSlash())
    app.use(customLogger())
    app.use(poweredBy())
    app.use(secureHeaders())
    app.use(cors())
    app.use(compress())
    app.notFound(notFoundFn)
    app.onError(onErrorFn())

    return app
}

import { configure, getConsoleSink, getLogger } from '@logtape/logtape'
import { createMiddleware } from 'hono/factory'

;(async () => {
    await configure({
        sinks: {
            console: getConsoleSink(),
        },
        loggers: [
            {
                category: 'server',
                lowestLevel: 'info',
                sinks: ['console'],
            },
        ],
    })
})()

const logger = getLogger(['server'])

export const logTapeLogger = createMiddleware(async (c, next) => {
    logger.info(`[${c.req.method}] ${c.req.url}`)
    await next()
})

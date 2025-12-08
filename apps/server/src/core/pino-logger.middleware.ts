import { pickBy } from 'es-toolkit'
import { cloneRawRequest } from 'hono/request'
import { pinoLogger } from 'hono-pino'
import { pino, stdTimeFunctions } from 'pino'
import env from '../env'

const isProduction = env.NODE_ENV === 'production'

export const customPinoLogger = () => {
    return pinoLogger({
        http: {
            reqId: () => crypto.randomUUID(),
            onReqBindings: (c) => ({
                req: {
                    url: c.req.path,
                    method: c.req.method,
                    headers: pickBy(
                        c.req.header(),
                        (_value, key) =>
                            key.toLowerCase() === 'authorization' ||
                            key.toLowerCase().startsWith('x-'),
                    ),
                },
            }),
            onReqMessage: async (c) => {
                const clonedReq = await cloneRawRequest(c.req)
                const body = await clonedReq.text()
                return !isProduction ? `{ body: ${body ? body : '{}'} }` : '{}'
            },
        },
        pino: pino({
            redact: {
                paths: ['req.headers.authorization'],
            },
            transport: isProduction
                ? undefined
                : {
                      target: 'pino-pretty',
                  },
            timestamp: stdTimeFunctions.epochTime,
        }),
    })
}

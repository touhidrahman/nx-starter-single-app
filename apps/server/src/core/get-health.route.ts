import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import env from '../env'
import { ApiResponse } from '../utils/api-response.util'
import { AppRouteHandler } from './core.type'

const tags = ['Core']

export const healthRoute = createRoute({
    method: 'get',
    path: '/',
    tags,
    responses: {
        [OK]: ApiResponse(z.object({ port: z.number() }), 'Server running'),
    },
})

type HealthRoute = typeof healthRoute

export const healthRouteHandler: AppRouteHandler<HealthRoute> = (c) => {
    return c.json(
        {
            message: 'Server working!',
            success: true,
            data: {
                port: env.PORT,
                env: env.NODE_ENV,
                logLevel: env.LOG_LEVEL,
                dbMode: env.DB_MODE,
                dbUrl: env.DATABASE_URL.replace(/:.+@/, ':***@'), // Hide password in URL
                backendUrl: env.BACKEND_URL,
                frontendUrl: env.FRONTEND_URL,
            },
        },
        OK,
    )
}

import { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi'
import { PinoLogger } from 'hono-pino'

export enum SystemUserLevel {
    ADMIN = 'admin',
    USER = 'user',
}

export interface AppBindings {
    Variables: {
        logger: PinoLogger
        groupId?: string
    }
}

export type AppOpenAPI = OpenAPIHono<AppBindings>

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>

import { createRoute } from '@hono/zod-openapi'
import { MiddlewareHandler } from 'hono'
import { OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import z, { ZodObject } from 'zod'
import { ApiListResponse, ApiResponse } from '../../utils/api-response.util'
import { zQueryAccountTypes } from '../role/core/account-type-core.model'
import {
    zInsertAccountType,
    zSelectAccountType,
} from './core/account-type-core.model'

export abstract class BaseService<T> {
    abstract findMany(query: any): Promise<T[]>
    abstract count(query: any): Promise<number>
    abstract create(data: any): Promise<T>
    abstract findById(id: string): Promise<T | null>
    abstract update(id: string, data: any): Promise<T | null>
    abstract delete(id: string): Promise<boolean>
    abstract exists(id: string): Promise<boolean>
    abstract findOne(query: any): Promise<T | null>
    abstract deleteMany(ids: string[]): Promise<number>
}

export class EntityRouteBuilder {
    private path: string
    private tags: string[]
    private middleware: MiddlewareHandler[] = []
    private zQuery: ZodObject = z.object({})
    private zInsert: ZodObject = z.object({})
    private zUpdate: ZodObject = z.object({})
    private zSelect: ZodObject = z.object({})

    constructor(path: string, tags: string[]) {
        this.path = path
        this.tags = tags
    }

    setMiddleware(middleware: MiddlewareHandler[]): EntityRouteBuilder {
        this.middleware = middleware
        return this
    }

    setQuerySchema(zQuery: ZodObject): EntityRouteBuilder {
        this.zQuery = zQuery
        return this
    }

    setInsertSchema(zInsert: ZodObject): EntityRouteBuilder {
        this.zInsert = zInsert
        return this
    }

    setUpdateSchema(zUpdate: ZodObject): EntityRouteBuilder {
        this.zUpdate = zUpdate
        return this
    }

    setSelectSchema(zSelect: ZodObject): EntityRouteBuilder {
        this.zSelect = zSelect
        return this
    }

    buildListRoute(zQuery: z.ZodObject, middleware: MiddlewareHandler[] = []) {
        return createRoute({
            path: this.path,
            tags: this.tags,
            method: 'get',
            middleware: middleware.length ? middleware : this.middleware,
            request: {
                query: zQuery,
            },
            responses: {
                [OK]: ApiListResponse(z.array(this.zSelect), 'List'),
            },
        })
    }

    buildCreateRoute(
        middleware: MiddlewareHandler[] = [],
    ): ReturnType<typeof createRoute> {
        return createRoute({
            path: this.path,
            tags: this.tags,
            method: 'post',
            middleware: middleware.length ? middleware : this.middleware,
            request: {
                body: jsonContent(this.zInsert, 'Input'),
            },
            responses: {
                [OK]: ApiResponse(this.zSelect, 'Create'),
            },
        })
    }
}

export const accountTypeRouteBuilder = new EntityRouteBuilder(
    '/account-types',
    ['AccountType'],
)
    .setQuerySchema(zQueryAccountTypes)
    .setInsertSchema(zInsertAccountType)
    .setSelectSchema(zSelectAccountType)

const rt = accountTypeRouteBuilder.buildListRoute(zQueryAccountTypes)

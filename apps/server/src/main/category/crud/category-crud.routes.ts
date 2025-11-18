import { createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { FORBIDDEN, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty, zId } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import {
    zInsertCategory,
    zQueryCategories,
    zSelectCategory,
    zUpdateCategory,
} from '../core/category-core.model'
import { CategoryCrudService } from './category-crud.service'

const tags = [APP_OPENAPI_TAGS.Category]
const path = '/crud/categories'

const GetCategoryListCrudDef = createRoute({
    path: path,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        query: zQueryCategories,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectCategory), 'Category List'),
    },
})

const GetCategoryListCrud: AppRouteHandler<
    typeof GetCategoryListCrudDef
> = async (c) => {
    const query = c.req.valid('query')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const groupSpecificQuery = { ...query, groupId }
    const data = await CategoryCrudService.findMany(groupSpecificQuery)
    const count = await CategoryCrudService.count(groupSpecificQuery)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Category list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetCategoryCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectCategory, 'Item'),
    },
})

const GetCategoryCrud: AppRouteHandler<typeof GetCategoryCrudDef> = async (
    c,
) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(NOT_FOUND, { message: 'Category not found' })
    }

    const existing = await CategoryCrudService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Category not found' })
    }

    return c.json(
        {
            data: existing,
            message: 'Category fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateCategoryCrudDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(zInsertCategory, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectCategory, 'Item'),
    },
})

const CreateCategoryCrud: AppRouteHandler<
    typeof CreateCategoryCrudDef
> = async (c) => {
    const { groupId, sub: creatorId } = c.get(
        'jwtPayload',
    ) as AccessTokenPayload
    const input = c.req.valid('json')

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Category could not be created',
        })
    }

    const data = await CategoryCrudService.create({
        ...input,
        groupId,
        creatorId,
    })

    return c.json(
        {
            data,
            message: 'Category created successfully',
            success: true,
        },
        OK,
    )
}

const UpdateCategoryCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware: [checkToken] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateCategory, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectCategory, 'Item'),
    },
})

const UpdateCategoryCrud: AppRouteHandler<
    typeof UpdateCategoryCrudDef
> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Category cannot be updated',
        })
    }

    const existing = await CategoryCrudService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Category not found' })
    }

    const input = c.req.valid('json')
    const data = await CategoryCrudService.update(existing.id, {
        ...input,
        groupId,
    })

    return c.json(
        {
            data,
            message: 'Category updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteCategoryCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware: [checkToken] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Item'),
    },
})

const DeleteCategoryCrud: AppRouteHandler<
    typeof DeleteCategoryCrudDef
> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Category cannot be deleted',
        })
    }

    const existing = await CategoryCrudService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Category not found' })
    }
    await CategoryCrudService.delete(existing.id)

    return c.json(
        {
            data: {},
            message: 'Category deleted successfully',
            success: true,
        },
        OK,
    )
}

export const categoryCrudRoutes = createRouter()
    .openapi(GetCategoryListCrudDef, GetCategoryListCrud)
    .openapi(CreateCategoryCrudDef, CreateCategoryCrud)
    .openapi(UpdateCategoryCrudDef, UpdateCategoryCrud)
    .openapi(DeleteCategoryCrudDef, DeleteCategoryCrud)
    .openapi(GetCategoryCrudDef, GetCategoryCrud)

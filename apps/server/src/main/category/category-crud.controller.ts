import { createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { FORBIDDEN, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../core/core.type'
import { createRouter } from '../../core/create-app'
import { checkPermission } from '../../middlewares/check-permission.middleware'
import { checkToken } from '../../middlewares/check-token.middleware'
import { zId } from '../../models/common.schema'
import { ApiListResponse, ApiResponse } from '../../utils/api-response.util'
import { throwHttpError } from '../../utils/error.util'
import { buildPaginationResponse } from '../../utils/pagination.util'
import { AccessTokenPayload } from '../auth/auth.model'
import {
    zInsertCategory,
    zQueryCategories,
    zSelectCategory,
    zUpdateCategory,
} from './category.model'
import { CategoryService } from './category.service'

const tags = ['Category']
const path = '/categories'

const GetCategoryListDef = createRoute({
    path: path,
    tags,
    method: 'get',
    middleware: [checkToken, checkPermission(['Category:Read'])] as const,
    request: {
        query: zQueryCategories,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectCategory), 'Category List'),
    },
})

const GetCategoryList: AppRouteHandler<typeof GetCategoryListDef> = async (
    c,
) => {
    try {
        const query = c.req.valid('query')
        const { groupId } = c.get('jwtPayload') as AccessTokenPayload
        const groupSpecificQuery = { ...query, groupId }
        const data = await CategoryService.findMany(groupSpecificQuery)
        const count = await CategoryService.count(groupSpecificQuery)

        return c.json(
            {
                data,
                pagination: buildPaginationResponse(
                    query.page,
                    query.size,
                    count,
                ),
                message: 'Category list fetched successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        throwHttpError(error, 'Failed to fetch Category list')
    }
}

const GetCategoryDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'get',
    middleware: [checkToken, checkPermission(['Category:Read'])] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectCategory, 'Item'),
    },
})

const GetCategory: AppRouteHandler<typeof GetCategoryDef> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(NOT_FOUND, { message: 'Category not found' })
    }

    const existing = await CategoryService.findByIdAndGroupId(id, groupId)
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

const CreateCategoryDef = createRoute({
    path,
    tags,
    method: 'post',
    middleware: [checkToken, checkPermission(['Category:Write'])] as const,
    request: {
        body: jsonContent(zInsertCategory, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectCategory, 'Item'),
    },
})

const CreateCategory: AppRouteHandler<typeof CreateCategoryDef> = async (c) => {
    const { groupId, sub: creatorId } = c.get(
        'jwtPayload',
    ) as AccessTokenPayload
    const input = c.req.valid('json')

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Category could not be created',
        })
    }

    try {
        const data = await CategoryService.create({
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
    } catch (error) {
        throwHttpError(error, 'Failed to create Category')
    }
}

const UpdateCategoryDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'put',
    middleware: [checkToken, checkPermission(['Category:Write'])] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateCategory, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectCategory, 'Item'),
    },
})

const UpdateCategory: AppRouteHandler<typeof UpdateCategoryDef> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Category cannot be updated',
        })
    }

    const existing = await CategoryService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Category not found' })
    }

    const input = c.req.valid('json')
    const data = await CategoryService.update(existing.id, {
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

const DeleteCategoryDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'delete',
    middleware: [checkToken, checkPermission(['Category:Delete'])] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectCategory, 'Deleted Category'),
    },
})

const DeleteCategory: AppRouteHandler<typeof DeleteCategoryDef> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Category cannot be deleted',
        })
    }

    const existing = await CategoryService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Category not found' })
    }

    try {
        await CategoryService.delete(existing.id)

        return c.json(
            {
                data: existing,
                message: 'Category deleted successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        throwHttpError(error, 'Failed to delete Category')
    }
}

export const categoryCrudRoutes = createRouter()
    .openapi(GetCategoryListDef, GetCategoryList)
    .openapi(CreateCategoryDef, CreateCategory)
    .openapi(UpdateCategoryDef, UpdateCategory)
    .openapi(DeleteCategoryDef, DeleteCategory)
    .openapi(GetCategoryDef, GetCategory)

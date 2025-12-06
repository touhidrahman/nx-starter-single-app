import { createRoute, z } from '@hono/zod-openapi'
import { CREATED, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../core/core.type'
import { createRouter } from '../../core/create-app'
import { zEmpty, zId, zIds } from '../../models/common.schema'
import { ApiListResponse, ApiResponse } from '../../utils/api-response.util'
import { buildPaginationResponse } from '../../utils/pagination.util'
import {
    zInsertCategory,
    zQueryCategories,
    zSelectCategory,
    zUpdateCategory,
} from './category.model'
import { CategoryCoreService } from './category-core.service'

const tags = ['Category']
const path = '/core/categories'
const middleware = undefined

const GetCategoryListCoreDef = createRoute({
    path,
    tags,
    method: 'get',
    middleware,
    request: {
        query: zQueryCategories,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectCategory), 'Category List'),
    },
})

const GetCategoryListCore: AppRouteHandler<
    typeof GetCategoryListCoreDef
> = async (c) => {
    const query = c.req.valid('query')
    const data = await CategoryCoreService.findMany(query)
    const count = await CategoryCoreService.count(query)

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

const GetCategoryByIdCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'get',
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectCategory, 'Category details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Category not found'),
    },
})

const GetCategoryByIdCore: AppRouteHandler<
    typeof GetCategoryByIdCoreDef
> = async (c) => {
    const { id } = c.req.valid('param')
    const category = await CategoryCoreService.findById(id)

    if (!category) {
        return c.json(
            {
                data: {},
                message: 'Category not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    return c.json(
        {
            data: category,
            message: 'Category details fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateCategoryCoreDef = createRoute({
    path,
    tags,
    method: 'post',
    middleware,
    request: {
        body: jsonContent(zInsertCategory, 'Category Create Data'),
    },
    responses: {
        [CREATED]: ApiResponse(
            zSelectCategory,
            'Category created successfully',
        ),
    },
})

const CreateCategoryCore: AppRouteHandler<
    typeof CreateCategoryCoreDef
> = async (c) => {
    const body = c.req.valid('json')
    const newCategory = await CategoryCoreService.create(body)

    return c.json(
        {
            data: newCategory,
            message: 'Category created successfully',
            success: true,
        },
        CREATED,
    )
}

const UpdateCategoryCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'put',
    middleware,
    request: {
        params: zId,
        body: jsonContent(zUpdateCategory, 'Category Update Data'),
    },
    responses: {
        [OK]: ApiResponse(zSelectCategory, 'Category updated successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Category not found'),
    },
})

const UpdateCategoryCore: AppRouteHandler<
    typeof UpdateCategoryCoreDef
> = async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const existingCategory = await CategoryCoreService.findById(id)

    if (!existingCategory) {
        return c.json(
            {
                data: {},
                message: 'Category not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    const updatedCategory = await CategoryCoreService.update(id, body)

    return c.json(
        {
            data: updatedCategory,
            message: 'Category updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteCategoryCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'delete',
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectCategory, 'Category deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Category not found'),
    },
})

const DeleteCategoryCore: AppRouteHandler<
    typeof DeleteCategoryCoreDef
> = async (c) => {
    const { id } = c.req.valid('param')
    const existingCategory = await CategoryCoreService.findById(id)

    if (!existingCategory) {
        return c.json(
            {
                data: {},
                message: 'Category not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    await CategoryCoreService.delete(id)

    return c.json(
        {
            data: existingCategory,
            message: 'Category deleted successfully',
            success: true,
        },
        OK,
    )
}

const DeleteManyCategoryCoreDef = createRoute({
    path,
    tags,
    method: 'delete',
    middleware,
    request: {
        body: jsonContent(zIds, 'Category IDs to delete'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Categories deleted successfully'),
    },
})

const DeleteManyCategoryCore: AppRouteHandler<
    typeof DeleteManyCategoryCoreDef
> = async (c) => {
    const { ids } = c.req.valid('json')

    await CategoryCoreService.deleteMany(ids)

    return c.json(
        {
            data: {},
            message: 'Categories deleted successfully',
            success: true,
        },
        OK,
    )
}

export const categoryCoreRoutes = createRouter()
    .openapi(DeleteCategoryCoreDef, DeleteCategoryCore)
    .openapi(UpdateCategoryCoreDef, UpdateCategoryCore)
    .openapi(GetCategoryByIdCoreDef, GetCategoryByIdCore)
    .openapi(DeleteManyCategoryCoreDef, DeleteManyCategoryCore)
    .openapi(CreateCategoryCoreDef, CreateCategoryCore)
    .openapi(GetCategoryListCoreDef, GetCategoryListCore)

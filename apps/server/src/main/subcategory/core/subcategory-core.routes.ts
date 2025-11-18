import { createRoute, z } from '@hono/zod-openapi'
import { CREATED, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { zEmpty, zId, zIds } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import {
    zInsertSubcategory,
    zQuerySubcategories,
    zSelectSubcategory,
    zUpdateSubcategory,
} from './subcategory-core.model'
import { SubcategoryCoreService } from './subcategory-core.service'

const tags = [APP_OPENAPI_TAGS.Subcategory]
const path = '/core/subcategories'
const middleware = undefined // [checkToken, isAdmin]

const GetSubcategoryListCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        query: zQuerySubcategories,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectSubcategory), 'Subcategory List'),
    },
})

const GetSubcategoryListCore: AppRouteHandler<
    typeof GetSubcategoryListCoreDef
> = async (c) => {
    const query = c.req.valid('query')
    const data = await SubcategoryCoreService.findMany(query)
    const count = await SubcategoryCoreService.count(query)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Subcategory list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetSubcategoryByIdCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectSubcategory, 'Subcategory details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Subcategory not found'),
    },
})

const GetSubcategoryByIdCore: AppRouteHandler<
    typeof GetSubcategoryByIdCoreDef
> = async (c) => {
    const { id } = c.req.valid('param')
    const subcategory = await SubcategoryCoreService.findById(id)

    if (!subcategory) {
        return c.json(
            {
                data: {},
                message: 'Subcategory not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    return c.json(
        {
            data: subcategory,
            message: 'Subcategory details fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateSubcategoryCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware,
    request: {
        body: jsonContent(zInsertSubcategory, 'Subcategory Create Data'),
    },
    responses: {
        [CREATED]: ApiResponse(
            zSelectSubcategory,
            'Subcategory created successfully',
        ),
    },
})

const CreateSubcategoryCore: AppRouteHandler<
    typeof CreateSubcategoryCoreDef
> = async (c) => {
    const body = c.req.valid('json')
    const newSubcategory = await SubcategoryCoreService.create(body)

    return c.json(
        {
            data: newSubcategory,
            message: 'Subcategory created successfully',
            success: true,
        },
        CREATED,
    )
}

const UpdateSubcategoryCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware,
    request: {
        params: zId,
        body: jsonContent(zUpdateSubcategory, 'Subcategory Update Data'),
    },
    responses: {
        [OK]: ApiResponse(
            zSelectSubcategory,
            'Subcategory updated successfully',
        ),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Subcategory not found'),
    },
})

const UpdateSubcategoryCore: AppRouteHandler<
    typeof UpdateSubcategoryCoreDef
> = async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const existingSubcategory = await SubcategoryCoreService.findById(id)

    if (!existingSubcategory) {
        return c.json(
            {
                data: {},
                message: 'Subcategory not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    const updatedSubcategory = await SubcategoryCoreService.update(id, body)

    return c.json(
        {
            data: updatedSubcategory,
            message: 'Subcategory updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteSubcategoryCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Subcategory deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Subcategory not found'),
    },
})

const DeleteSubcategoryCore: AppRouteHandler<
    typeof DeleteSubcategoryCoreDef
> = async (c) => {
    const { id } = c.req.valid('param')
    const existingSubcategory = await SubcategoryCoreService.findById(id)

    if (!existingSubcategory) {
        return c.json(
            {
                data: {},
                message: 'Subcategory not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    await SubcategoryCoreService.delete(id)

    return c.json(
        {
            data: {},
            message: 'Subcategory deleted successfully',
            success: true,
        },
        OK,
    )
}

const DeleteManySubcategoryCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        body: jsonContent(zIds, 'Subcategory IDs to delete'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Subcategories deleted successfully'),
    },
})

const DeleteManySubcategoryCore: AppRouteHandler<
    typeof DeleteManySubcategoryCoreDef
> = async (c) => {
    const { ids } = c.req.valid('json')

    await SubcategoryCoreService.deleteMany(ids)

    return c.json(
        {
            data: {},
            message: 'Subcategories deleted successfully',
            success: true,
        },
        OK,
    )
}

export const subcategoryCoreRoutes = createRouter()
    .openapi(DeleteSubcategoryCoreDef, DeleteSubcategoryCore)
    .openapi(DeleteManySubcategoryCoreDef, DeleteManySubcategoryCore)
    .openapi(UpdateSubcategoryCoreDef, UpdateSubcategoryCore)
    .openapi(CreateSubcategoryCoreDef, CreateSubcategoryCore)
    .openapi(GetSubcategoryByIdCoreDef, GetSubcategoryByIdCore)
    .openapi(GetSubcategoryListCoreDef, GetSubcategoryListCore)

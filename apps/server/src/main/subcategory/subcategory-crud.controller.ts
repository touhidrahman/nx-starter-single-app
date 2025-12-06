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
    zInsertSubcategory,
    zQuerySubcategories,
    zSelectSubcategory,
    zUpdateSubcategory,
} from './subcategory.model'
import { SubcategoryService } from './subcategory.service'

const tags = ['Subcategory']
const path = '/subcategories'

const GetSubcategoryListDef = createRoute({
    path: path,
    tags,
    method: 'get',
    middleware: [checkToken, checkPermission(['Subcategory:Read'])] as const,
    request: {
        query: zQuerySubcategories,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectSubcategory), 'Subcategory List'),
    },
})

const GetSubcategoryList: AppRouteHandler<
    typeof GetSubcategoryListDef
> = async (c) => {
    try {
        const query = c.req.valid('query')
        const { groupId } = c.get('jwtPayload') as AccessTokenPayload
        const groupSpecificQuery = { ...query, groupId }
        const data = await SubcategoryService.findMany(groupSpecificQuery)
        const count = await SubcategoryService.count(groupSpecificQuery)

        return c.json(
            {
                data,
                pagination: buildPaginationResponse(
                    query.page,
                    query.size,
                    count,
                ),
                message: 'Subcategory list fetched successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        throwHttpError(error, 'Failed to fetch Subcategory list')
    }
}

const GetSubcategoryDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'get',
    middleware: [checkToken, checkPermission(['Subcategory:Read'])] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectSubcategory, 'Item'),
    },
})

const GetSubcategory: AppRouteHandler<typeof GetSubcategoryDef> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(NOT_FOUND, { message: 'Subcategory not found' })
    }

    const existing = await SubcategoryService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Subcategory not found' })
    }

    return c.json(
        {
            data: existing,
            message: 'Subcategory fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateSubcategoryDef = createRoute({
    path,
    tags,
    method: 'post',
    middleware: [checkToken, checkPermission(['Subcategory:Write'])] as const,
    request: {
        body: jsonContent(zInsertSubcategory, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectSubcategory, 'Item'),
    },
})

const CreateSubcategory: AppRouteHandler<typeof CreateSubcategoryDef> = async (
    c,
) => {
    const { groupId, sub: creatorId } = c.get(
        'jwtPayload',
    ) as AccessTokenPayload
    const input = c.req.valid('json')

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Subcategory could not be created',
        })
    }

    try {
        const data = await SubcategoryService.create({
            ...input,
            groupId,
            creatorId,
        })

        return c.json(
            {
                data,
                message: 'Subcategory created successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        throwHttpError(error, 'Failed to create Subcategory')
    }
}

const UpdateSubcategoryDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'put',
    middleware: [checkToken, checkPermission(['Subcategory:Write'])] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateSubcategory, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectSubcategory, 'Item'),
    },
})

const UpdateSubcategory: AppRouteHandler<typeof UpdateSubcategoryDef> = async (
    c,
) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Subcategory cannot be updated',
        })
    }

    const existing = await SubcategoryService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Subcategory not found' })
    }

    const input = c.req.valid('json')
    const data = await SubcategoryService.update(existing.id, {
        ...input,
        groupId,
    })

    return c.json(
        {
            data,
            message: 'Subcategory updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteSubcategoryDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'delete',
    middleware: [checkToken, checkPermission(['Subcategory:Delete'])] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectSubcategory, 'Deleted Subcategory'),
    },
})

const DeleteSubcategory: AppRouteHandler<typeof DeleteSubcategoryDef> = async (
    c,
) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Subcategory cannot be deleted',
        })
    }

    const existing = await SubcategoryService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Subcategory not found' })
    }

    try {
        await SubcategoryService.delete(existing.id)

        return c.json(
            {
                data: existing,
                message: 'Subcategory deleted successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        throwHttpError(error, 'Failed to delete Subcategory')
    }
}

export const subcategoryCrudRoutes = createRouter()
    .openapi(GetSubcategoryListDef, GetSubcategoryList)
    .openapi(CreateSubcategoryDef, CreateSubcategory)
    .openapi(UpdateSubcategoryDef, UpdateSubcategory)
    .openapi(DeleteSubcategoryDef, DeleteSubcategory)
    .openapi(GetSubcategoryDef, GetSubcategory)

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
    zInsertSubcategory,
    zQuerySubcategories,
    zSelectSubcategory,
    zUpdateSubcategory,
} from '../core/subcategory-core.model'
import { SubcategoryCrudService } from './subcategory-crud.service'

const tags = [APP_OPENAPI_TAGS.Subcategory]
const path = '/crud/subcategories'

const GetSubcategoryListCrudDef = createRoute({
    path: path,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        query: zQuerySubcategories,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectSubcategory), 'Subcategory List'),
    },
})

const GetSubcategoryListCrud: AppRouteHandler<
    typeof GetSubcategoryListCrudDef
> = async (c) => {
    const query = c.req.valid('query')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const groupSpecificQuery = { ...query, groupId }
    const data = await SubcategoryCrudService.findMany(groupSpecificQuery)
    const count = await SubcategoryCrudService.count(groupSpecificQuery)

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

const GetSubcategoryCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectSubcategory, 'Item'),
    },
})

const GetSubcategoryCrud: AppRouteHandler<
    typeof GetSubcategoryCrudDef
> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(NOT_FOUND, { message: 'Subcategory not found' })
    }

    const existing = await SubcategoryCrudService.findByIdAndGroupId(
        id,
        groupId,
    )
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

const CreateSubcategoryCrudDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(zInsertSubcategory, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectSubcategory, 'Item'),
    },
})

const CreateSubcategoryCrud: AppRouteHandler<
    typeof CreateSubcategoryCrudDef
> = async (c) => {
    const { groupId, sub: creatorId } = c.get(
        'jwtPayload',
    ) as AccessTokenPayload
    const input = c.req.valid('json')

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Subcategory could not be created',
        })
    }

    const data = await SubcategoryCrudService.create({
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
}

const UpdateSubcategoryCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware: [checkToken] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateSubcategory, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectSubcategory, 'Item'),
    },
})

const UpdateSubcategoryCrud: AppRouteHandler<
    typeof UpdateSubcategoryCrudDef
> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Subcategory cannot be updated',
        })
    }

    const existing = await SubcategoryCrudService.findByIdAndGroupId(
        id,
        groupId,
    )
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Subcategory not found' })
    }

    const input = c.req.valid('json')
    const data = await SubcategoryCrudService.update(existing.id, {
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

const DeleteSubcategoryCrudDef = createRoute({
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

const DeleteSubcategoryCrud: AppRouteHandler<
    typeof DeleteSubcategoryCrudDef
> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Subcategory cannot be deleted',
        })
    }

    const existing = await SubcategoryCrudService.findByIdAndGroupId(
        id,
        groupId,
    )
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Subcategory not found' })
    }
    await SubcategoryCrudService.delete(existing.id)

    return c.json(
        {
            data: {},
            message: 'Subcategory deleted successfully',
            success: true,
        },
        OK,
    )
}

export const subcategoryCrudRoutes = createRouter()
    .openapi(GetSubcategoryListCrudDef, GetSubcategoryListCrud)
    .openapi(CreateSubcategoryCrudDef, CreateSubcategoryCrud)
    .openapi(UpdateSubcategoryCrudDef, UpdateSubcategoryCrud)
    .openapi(DeleteSubcategoryCrudDef, DeleteSubcategoryCrud)
    .openapi(GetSubcategoryCrudDef, GetSubcategoryCrud)

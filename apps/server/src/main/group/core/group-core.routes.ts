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
    zInsertGroup,
    zQueryGroups,
    zSelectGroup,
    zUpdateGroup,
} from './group-core.model'
import { GroupCoreService } from './group-core.service'

const tags = [APP_OPENAPI_TAGS.Group]
const path = '/core/groups'
const middleware = undefined // [checkToken, isAdmin]

const GetGroupListCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        query: zQueryGroups,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectGroup), 'Group List'),
    },
})

const GetGroupListCore: AppRouteHandler<typeof GetGroupListCoreDef> = async (
    c,
) => {
    const query = c.req.valid('query')
    const data = await GroupCoreService.findMany(query)
    const count = await GroupCoreService.count(query)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Group list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetGroupByIdCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectGroup, 'Group details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Group not found'),
    },
})

const GetGroupByIdCore: AppRouteHandler<typeof GetGroupByIdCoreDef> = async (
    c,
) => {
    const { id } = c.req.valid('param')
    const group = await GroupCoreService.findById(id)

    if (!group) {
        return c.json(
            {
                data: {},
                message: 'Group not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    return c.json(
        {
            data: group,
            message: 'Group details fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateGroupCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware,
    request: {
        body: jsonContent(zInsertGroup, 'Group Create Data'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectGroup, 'Group created successfully'),
    },
})

const CreateGroupCore: AppRouteHandler<typeof CreateGroupCoreDef> = async (
    c,
) => {
    const body = c.req.valid('json')
    const newGroup = await GroupCoreService.create(body)

    return c.json(
        {
            data: newGroup,
            message: 'Group created successfully',
            success: true,
        },
        CREATED,
    )
}

const UpdateGroupCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware,
    request: {
        params: zId,
        body: jsonContent(zUpdateGroup, 'Group Update Data'),
    },
    responses: {
        [OK]: ApiResponse(zSelectGroup, 'Group updated successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Group not found'),
    },
})

const UpdateGroupCore: AppRouteHandler<typeof UpdateGroupCoreDef> = async (
    c,
) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const existingGroup = await GroupCoreService.findById(id)

    if (!existingGroup) {
        return c.json(
            {
                data: {},
                message: 'Group not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    const updatedGroup = await GroupCoreService.update(id, body)

    return c.json(
        {
            data: updatedGroup,
            message: 'Group updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteGroupCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Group deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Group not found'),
    },
})

const DeleteGroupCore: AppRouteHandler<typeof DeleteGroupCoreDef> = async (
    c,
) => {
    const { id } = c.req.valid('param')
    const existingGroup = await GroupCoreService.findById(id)

    if (!existingGroup) {
        return c.json(
            {
                data: {},
                message: 'Group not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    await GroupCoreService.delete(id)

    return c.json(
        {
            data: {},
            message: 'Group deleted successfully',
            success: true,
        },
        OK,
    )
}

const DeleteManyGroupCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        body: jsonContent(zIds, 'Group IDs to delete'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Groups deleted successfully'),
    },
})

const DeleteManyGroupCore: AppRouteHandler<
    typeof DeleteManyGroupCoreDef
> = async (c) => {
    const { ids } = c.req.valid('json')

    await GroupCoreService.deleteMany(ids)

    return c.json(
        {
            data: {},
            message: 'Groups deleted successfully',
            success: true,
        },
        OK,
    )
}

export const groupCoreRoutes = createRouter()
    .openapi(DeleteGroupCoreDef, DeleteGroupCore)
    .openapi(DeleteManyGroupCoreDef, DeleteManyGroupCore)
    .openapi(UpdateGroupCoreDef, UpdateGroupCore)
    .openapi(CreateGroupCoreDef, CreateGroupCore)
    .openapi(GetGroupByIdCoreDef, GetGroupByIdCore)
    .openapi(GetGroupListCoreDef, GetGroupListCore)

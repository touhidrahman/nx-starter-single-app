import { createRoute, z } from '@hono/zod-openapi'
import { CREATED, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { zEmpty, zId, zIds } from '../../../models/common.schema'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { zInsertInvite, zQueryInvites, zSelectInvite, zUpdateInvite } from './invite-core.model'
import { InviteCoreService } from './invite-core.service'

const tags = ['Invites']
const path = '/core/invites'
const middleware = undefined // [checkToken, isAdmin]

const GetInviteListCoreDef = createRoute({
    path,
    tags,
    method: 'get',
    middleware,
    request: {
        query: zQueryInvites,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectInvite), 'Invite List'),
    },
})

const GetInviteListCore: AppRouteHandler<typeof GetInviteListCoreDef> = async (c) => {
    const query = c.req.valid('query')
    const data = await InviteCoreService.findMany(query)
    const count = await InviteCoreService.count(query)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Invite list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetInviteByIdCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'get',
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectInvite, 'Invite details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Invite not found'),
    },
})

const GetInviteByIdCore: AppRouteHandler<typeof GetInviteByIdCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const invite = await InviteCoreService.findById(id)

    if (!invite) {
        return c.json(
            {
                data: {},
                message: 'Invite not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    return c.json(
        {
            data: invite,
            message: 'Invite details fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateInviteCoreDef = createRoute({
    path,
    tags,
    method: 'post',
    middleware,
    request: {
        body: jsonContent(zInsertInvite, 'Invite Create Data'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectInvite, 'Invite created successfully'),
    },
})

const CreateInviteCore: AppRouteHandler<typeof CreateInviteCoreDef> = async (c) => {
    const body = c.req.valid('json')
    const newInvite = await InviteCoreService.create(body)

    return c.json(
        {
            data: newInvite,
            message: 'Invite created successfully',
            success: true,
        },
        CREATED,
    )
}

const UpdateInviteCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'put',
    middleware,
    request: {
        params: zId,
        body: jsonContent(zUpdateInvite, 'Invite Update Data'),
    },
    responses: {
        [OK]: ApiResponse(zSelectInvite, 'Invite updated successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Invite not found'),
    },
})

const UpdateInviteCore: AppRouteHandler<typeof UpdateInviteCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const existingInvite = await InviteCoreService.findById(id)

    if (!existingInvite) {
        return c.json(
            {
                data: {},
                message: 'Invite not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    const updatedInvite = await InviteCoreService.update(id, body)

    return c.json(
        {
            data: updatedInvite,
            message: 'Invite updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteInviteCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'delete',
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Invite deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Invite not found'),
    },
})

const DeleteInviteCore: AppRouteHandler<typeof DeleteInviteCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const existingInvite = await InviteCoreService.findById(id)

    if (!existingInvite) {
        return c.json(
            {
                data: {},
                message: 'Invite not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    await InviteCoreService.delete(id)

    return c.json(
        {
            data: {},
            message: 'Invite deleted successfully',
            success: true,
        },
        OK,
    )
}

const DeleteManyInviteCoreDef = createRoute({
    path,
    tags,
    method: 'delete',
    middleware,
    request: {
        body: jsonContent(zIds, 'Invite IDs to delete'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Invites deleted successfully'),
    },
})

const DeleteManyInviteCore: AppRouteHandler<typeof DeleteManyInviteCoreDef> = async (c) => {
    const { ids } = c.req.valid('json')

    await InviteCoreService.deleteMany(ids)

    return c.json(
        {
            data: {},
            message: 'Invites deleted successfully',
            success: true,
        },
        OK,
    )
}

export const inviteCoreRoutes = createRouter()
    .openapi(DeleteInviteCoreDef, DeleteInviteCore)
    .openapi(DeleteManyInviteCoreDef, DeleteManyInviteCore)
    .openapi(UpdateInviteCoreDef, UpdateInviteCore)
    .openapi(CreateInviteCoreDef, CreateInviteCore)
    .openapi(GetInviteByIdCoreDef, GetInviteByIdCore)
    .openapi(GetInviteListCoreDef, GetInviteListCore)

import { createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { FORBIDDEN, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkPermission } from '../../../middlewares/check-permission.middleware'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty, zId } from '../../../models/common.schema'
import { REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import {
    zInsertInvite,
    zQueryInvites,
    zSelectInvite,
    zUpdateInvite,
} from '../core/invite-core.model'
import { InviteCrudService } from './invite-crud.service'

const tags = ['Invites']
const path = '/crud/invites'

const GetInviteListCrudDef = createRoute({
    path: path,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken, checkPermission(['Invite:Read'])] as const,
    request: {
        query: zQueryInvites,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectInvite), 'Invite List'),
    },
})

const GetInviteListCrud: AppRouteHandler<typeof GetInviteListCrudDef> = async (
    c,
) => {
    const query = c.req.valid('query')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const groupSpecificQuery = { ...query, groupId }
    const data = await InviteCrudService.findMany(groupSpecificQuery)
    const count = await InviteCrudService.count(groupSpecificQuery)

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

const GetInviteCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken, checkPermission(['Invite:Read'])] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectInvite, 'Item'),
    },
})

const GetInviteCrud: AppRouteHandler<typeof GetInviteCrudDef> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    const existing = await InviteCrudService.findById(id)
    if (!existing || existing.groupId !== groupId) {
        throw new HTTPException(NOT_FOUND, { message: 'Invite not found' })
    }

    return c.json(
        {
            data: existing,
            message: 'Invite fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateInviteCrudDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware: [checkToken, checkPermission(['Invite:Write'])] as const,
    request: {
        body: jsonContent(zInsertInvite, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectInvite, 'Item'),
    },
})

const CreateInviteCrud: AppRouteHandler<typeof CreateInviteCrudDef> = async (
    c,
) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const input = c.req.valid('json')

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Invite could not be created',
        })
    }

    const data = await InviteCrudService.create({
        ...input,
        groupId,
    })

    return c.json(
        {
            data,
            message: 'Invite created successfully',
            success: true,
        },
        OK,
    )
}

const UpdateInviteCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware: [checkToken, checkPermission(['Invite:Write'])] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateInvite, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectInvite, 'Item'),
    },
})

const UpdateInviteCrud: AppRouteHandler<typeof UpdateInviteCrudDef> = async (
    c,
) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    const existing = await InviteCrudService.findById(id)
    if (!existing || existing.groupId !== groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Invite cannot be updated',
        })
    }

    const input = c.req.valid('json')
    const data = await InviteCrudService.update(existing.id, {
        ...input,
        groupId,
    })

    return c.json(
        {
            data,
            message: 'Invite updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteInviteCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware: [checkToken, checkPermission(['Invite:Delete'])] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Item'),
    },
})

const DeleteInviteCrud: AppRouteHandler<typeof DeleteInviteCrudDef> = async (
    c,
) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    const existing = await InviteCrudService.findById(id)
    if (!existing || existing.groupId !== groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Invite cannot be deleted',
        })
    }

    await InviteCrudService.delete(existing.id)

    return c.json(
        {
            data: {},
            message: 'Invite deleted successfully',
            success: true,
        },
        OK,
    )
}

export const inviteCrudRoutes = createRouter()
    .openapi(GetInviteListCrudDef, GetInviteListCrud)
    .openapi(CreateInviteCrudDef, CreateInviteCrud)
    .openapi(UpdateInviteCrudDef, UpdateInviteCrud)
    .openapi(DeleteInviteCrudDef, DeleteInviteCrud)
    .openapi(GetInviteCrudDef, GetInviteCrud)

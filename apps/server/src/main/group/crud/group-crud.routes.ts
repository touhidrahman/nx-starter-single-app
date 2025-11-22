import { createRoute } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { FORBIDDEN, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkPermission } from '../../../middlewares/check-permission.middleware'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty, zId } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../../models/common.values'
import { ApiResponse } from '../../../utils/api-response.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import { UserCustomService } from '../../user/custom/user-custom.service'
import {
    zInsertGroup,
    zSelectGroup,
    zUpdateGroup,
} from '../core/group-core.model'
import { GroupCrudService } from './group-crud.service'

const tags = [APP_OPENAPI_TAGS.Group]
const path = '/crud/groups'

const GetGroupCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectGroup, 'Item'),
    },
})

const GetGroupCrud: AppRouteHandler<typeof GetGroupCrudDef> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (id !== groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Group cannot be accessed',
        })
    }

    const existing = await GroupCrudService.findById(id)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Group not found' })
    }

    return c.json(
        {
            data: existing,
            message: 'Group fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateGroupCrudDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware: [checkToken, checkPermission(['Group:Write'])] as const,
    request: {
        body: jsonContent(zInsertGroup, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectGroup, 'Item'),
    },
})

const CreateGroupCrud: AppRouteHandler<typeof CreateGroupCrudDef> = async (
    c,
) => {
    // Depending on your business rules, you may restrict who can create groups.
    const input = c.req.valid('json')
    const { sub: creatorId } = c.get('jwtPayload') as AccessTokenPayload

    const data = await GroupCrudService.create({
        ...input,
        creatorId,
    })

    await UserCustomService.update(creatorId, { defaultGroupId: data.id })

    return c.json(
        {
            data,
            message: 'Group created successfully',
            success: true,
        },
        OK,
    )
}

const UpdateGroupCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware: [checkToken, checkPermission(['Group:Write'])] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateGroup, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectGroup, 'Item'),
    },
})

const UpdateGroupCrud: AppRouteHandler<typeof UpdateGroupCrudDef> = async (
    c,
) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (id !== groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Group cannot be updated',
        })
    }

    const existing = await GroupCrudService.findById(id)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Group not found' })
    }

    const input = c.req.valid('json')
    const data = await GroupCrudService.update(existing.id, {
        ...input,
    })

    return c.json(
        {
            data,
            message: 'Group updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteGroupCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware: [checkToken, checkPermission(['Group:Delete'])] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Item'),
    },
})

const DeleteGroupCrud: AppRouteHandler<typeof DeleteGroupCrudDef> = async (
    c,
) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (id !== groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Group cannot be deleted',
        })
    }

    const existing = await GroupCrudService.findById(id)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Group not found' })
    }
    await GroupCrudService.delete(existing.id)

    return c.json(
        {
            data: {},
            message: 'Group deleted successfully',
            success: true,
        },
        OK,
    )
}

export const groupCrudRoutes = createRouter()
    .openapi(CreateGroupCrudDef, CreateGroupCrud)
    .openapi(UpdateGroupCrudDef, UpdateGroupCrud)
    .openapi(DeleteGroupCrudDef, DeleteGroupCrud)
    .openapi(GetGroupCrudDef, GetGroupCrud)

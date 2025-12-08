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
    zInsertAccount,
    zQueryAccounts,
    zSelectAccount,
    zUpdateAccount,
} from '../core/account-core.model'
import { AccountCrudService } from './account-crud.service'

const tags = [APP_OPENAPI_TAGS.Account]
const path = '/accounts'

const GetAccountListCrudDef = createRoute({
    path: path,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        query: zQueryAccounts,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectAccount), 'Account List'),
    },
})

const GetAccountListCrud: AppRouteHandler<typeof GetAccountListCrudDef> = async (c) => {
    const query = c.req.valid('query')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const groupSpecificQuery = { ...query, groupId }
    const data = await AccountCrudService.findMany(groupSpecificQuery)
    const count = await AccountCrudService.count(groupSpecificQuery)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Account list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetAccountCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectAccount, 'Item'),
    },
})

const GetAccountCrud: AppRouteHandler<typeof GetAccountCrudDef> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, { message: 'Account not found' })
    }

    const existing = await AccountCrudService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Account not found' })
    }

    return c.json(
        {
            data: existing,
            message: 'Account fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateAccountCrudDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(zInsertAccount, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectAccount, 'Item'),
    },
})

const CreateAccountCrud: AppRouteHandler<typeof CreateAccountCrudDef> = async (c) => {
    const { groupId, sub: creatorId } = c.get('jwtPayload') as AccessTokenPayload
    const input = c.req.valid('json')

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Account could not be created',
        })
    }

    const data = await AccountCrudService.create({
        ...input,
        groupId,
        creatorId,
    })

    return c.json(
        {
            data,
            message: 'Account created successfully',
            success: true,
        },
        OK,
    )
}

const UpdateAccountCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware: [checkToken] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateAccount, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectAccount, 'Item'),
    },
})

const UpdateAccountCrud: AppRouteHandler<typeof UpdateAccountCrudDef> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Account cannot be updated',
        })
    }

    const existing = await AccountCrudService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Account not found' })
    }

    const input = c.req.valid('json')
    const data = await AccountCrudService.update(existing.id, {
        ...input,
        groupId,
    })

    return c.json(
        {
            data,
            message: 'Account updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteAccountCrudDef = createRoute({
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

const DeleteAccountCrud: AppRouteHandler<typeof DeleteAccountCrudDef> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Account cannot be deleted',
        })
    }

    const existing = await AccountCrudService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Account not found' })
    }
    await AccountCrudService.delete(existing.id)

    return c.json(
        {
            data: {},
            message: 'Account deleted successfully',
            success: true,
        },
        OK,
    )
}

export const accountCrudRoutes = createRouter()
    .openapi(GetAccountListCrudDef, GetAccountListCrud)
    .openapi(CreateAccountCrudDef, CreateAccountCrud)
    .openapi(UpdateAccountCrudDef, UpdateAccountCrud)
    .openapi(DeleteAccountCrudDef, DeleteAccountCrud)
    .openapi(GetAccountCrudDef, GetAccountCrud)

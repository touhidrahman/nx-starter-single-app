import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../core/core.type'
import { createRouter } from '../../core/create-app'
import { checkToken } from '../../core/middlewares/check-token.middleware'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../core/models/common.values'
import { ApiListResponse } from '../../core/utils/api-response.util'
import { buildPaginationResponse } from '../../core/utils/pagination.util'
import {
    zQueryAccounts,
    zSelectAccount,
} from '../../crud/account/account-crud.model'
import { AccessTokenPayload } from '../auth/token.util'
import { AccountService } from './account.service'

const tags = [APP_OPENAPI_TAGS.ACCOUNT]

const getAccountsRoute = createRoute({
    path: '/bff/accounts',
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        query: zQueryAccounts,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectAccount), 'List of Accounts'),
    },
})

const getAccountsHandler: AppRouteHandler<typeof getAccountsRoute> = async (
    c,
) => {
    const { page, size, ...query } = c.req.valid('query')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const groupSpecificQuery = { ...query, groupId }
    const data = await AccountService.findMany(groupSpecificQuery)
    const count = await AccountService.count(groupSpecificQuery)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(page, size, count),
            message: 'Account list fetched successfully',
            success: true,
        },
        OK,
    )
}

export const accountRoutes = createRouter().openapi(
    getAccountsRoute,
    getAccountsHandler,
)

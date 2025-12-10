import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { APP_OPENAPI_TAGS } from '../../../models/common.values'
import { ApiListResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import { zQueryAccounts, zSelectAccount } from '../core/account-core.model'
import { AccountCustomService } from './account-custom.service'

const tags = [APP_OPENAPI_TAGS.Account]
const path = '/accounts/custom'

const GetMyAccountListDef = createRoute({
    path: `${path}/my`,
    tags,
    method: 'get',
    middleware: [checkToken] as const,
    request: {
        query: zQueryAccounts,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectAccount), 'Account List'),
    },
})

const GetAccountListCrud: AppRouteHandler<typeof GetMyAccountListDef> = async (c) => {
    const query = c.req.valid('query')
    const { groupId, sub: creatorId } = c.get('jwtPayload') as AccessTokenPayload

    const groupAndUserSpecificQuery = { ...query, groupId, creatorId }
    const data = await AccountCustomService.findMany(groupAndUserSpecificQuery)
    const count = await AccountCustomService.count(groupAndUserSpecificQuery)

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

export const accountCustomRoutes = createRouter().openapi(GetMyAccountListDef, GetAccountListCrud)

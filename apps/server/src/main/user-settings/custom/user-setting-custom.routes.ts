import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import { zQueryUserSettings, zSelectUserSetting } from '../core/user-setting-core.model'
import { UserSettingCustomService } from './user-setting-custom.service'

const tags = ['UserSettings']
const path = '/custom/user-settings'

const GetMyUserSettingListDef = createRoute({
    path: `${path}/my`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        query: zQueryUserSettings,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectUserSetting), 'UserSetting List'),
    },
})

const GetMyUserSettingList: AppRouteHandler<typeof GetMyUserSettingListDef> = async (c) => {
    const query = c.req.valid('query')
    const { sub: userId } = c.get('jwtPayload') as AccessTokenPayload

    const userSpecificQuery = { ...query, userId }
    const data = await UserSettingCustomService.findMany(userSpecificQuery)
    const count = await UserSettingCustomService.count(userSpecificQuery)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'UserSetting list fetched successfully',
            success: true,
        },
        OK,
    )
}

export const userSettingCustomRoutes = createRouter().openapi(
    GetMyUserSettingListDef,
    GetMyUserSettingList,
)

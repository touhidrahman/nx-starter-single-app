import { createRoute } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../../models/common.values'
import { ApiResponse } from '../../../utils/api-response.util'
import { zUserLogin, zUserLoginResponse } from './user-custom.model'
import { UserCustomService } from './user-custom.service'

const tags = [APP_OPENAPI_TAGS.User]
const path = '/custom/users'

const LoginUserDef = createRoute({
    path: `${path}/login`,
    tags,
    method: REQ_METHOD.POST,
    request: {
        body: jsonContentRequired(zUserLogin, 'User Login Data'),
    },
    responses: {
        [OK]: ApiResponse(zUserLoginResponse, 'Item'),
    },
})

const LoginUser: AppRouteHandler<typeof LoginUserDef> = async (c) => {
    const existing = await UserCustomService.findById(id)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'User not found' })
    }

    return c.json(
        {
            data: existing,
            message: 'User fetched successfully',
            success: true,
        },
        OK,
    )
}

export const userCustomRoutes = createRouter().openapi(LoginUserDef, LoginUser)

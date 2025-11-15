import { createRoute } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import jsonContent from 'stoker/openapi/helpers/json-content'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../../models/common.values'
import { SEED_DATA_PLANS } from '../../../seed/seed-data'
import { ApiResponse } from '../../../utils/api-response.util'
import { seedPlans } from '../../../utils/seed.service'
import { zSelectAdmin } from '../core/admin-core.model'
import { zRegisterAdmin } from './admin-custom.model'
import { AdminCustomService } from './admin-custom.service'

const tags = [APP_OPENAPI_TAGS.Admin]
const path = '/custom/admins'

const RegisterAdminDef = createRoute({
    path: `${path}/register`,
    tags,
    method: REQ_METHOD.POST,
    request: {
        body: jsonContent(zRegisterAdmin, 'Admin Registration Data'),
    },
    responses: {
        [OK]: ApiResponse(zSelectAdmin, 'Admin'),
    },
})

const RegisterAdmin: AppRouteHandler<typeof RegisterAdminDef> = async (c) => {
    const body = c.req.valid('json')
    const isTableEmpty = await AdminCustomService.isTableEmpty()
    if (!isTableEmpty) {
        // do more things like seeding default data
        await seedPlans(SEED_DATA_PLANS)
        // TODO: insert account types
    }
    const data = await AdminCustomService.register(body)

    return c.json(
        {
            data,
            message: 'Admin registered successfully',
            success: true,
        },
        OK,
    )
}

export const adminCustomRoutes = createRouter().openapi(
    RegisterAdminDef,
    RegisterAdmin,
)

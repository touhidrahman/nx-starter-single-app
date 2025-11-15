import { createRoute } from '@hono/zod-openapi'
import * as argon2 from 'argon2'
import { sql } from 'drizzle-orm'
import {
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
    OK,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { db } from '../../../db/db'
import { adminsTable } from '../../../db/schema'
import { zEmpty } from '../../../models/common.schema'
import { SEED_DATA_PLANS } from '../../../seed/seed-data'
import { ApiResponse } from '../../../utils/api-response.util'
import { seedPlans } from '../../../utils/seed.service'
import { zInsertAdmin, zSelectAdminWithoutPassword } from '../admin.schema'
import { createAdminUser } from '../admin-user.service'

export const createFirstAdminRoute = createRoute({
    path: '/admin/first',
    method: 'post',
    tags: ['Admin'],
    request: {
        body: jsonContent(zInsertAdmin, 'Admin user'),
    },
    responses: {
        [OK]: ApiResponse(zSelectAdminWithoutPassword, 'Admin account created'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid admin data'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const createFirstAdminHandler: AppRouteHandler<
    typeof createFirstAdminRoute
> = async (c) => {
    const firstAdmin = await db
        .select({ count: sql<number>`count(*)` })
        .from(adminsTable)

    if (firstAdmin[0].count > 0) {
        return c.json(
            { data: {}, message: 'Admin already exists', success: false },
            BAD_REQUEST,
        )
    }

    const user = c.req.valid('json')
    const hash = await argon2.hash(user.password)

    try {
        // seed plans
        await seedPlans(SEED_DATA_PLANS)

        const response = await createAdminUser({ ...user, password: hash })

        return c.json(
            {
                data: { ...response, password: '' },
                message: 'Admin created',
                success: true,
            },
            OK,
        )
    } catch (error) {
        c.var.logger.error(error, 'Error creating first admin user')
        return c.json(
            {
                data: {},
                message: 'Internal server error',
                success: false,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}

import { createRoute } from '@hono/zod-openapi'
import * as argon2 from 'argon2'
import { shake } from 'radash'
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../core/core.type'
import { checkToken } from '../../middlewares/check-token.middleware'
import { isAdmin } from '../../middlewares/is-admin.middleware'
import { zEmpty, zId } from '../../models/common.schema'
import { ApiResponse } from '../../utils/api-response.util'
import { zSelectAdminWithoutPassword, zUpdateAdmin } from '../admin.schema'
import { getAdminUserById, updateAdminUser } from '../admin-user.service'

export const updateAdminUserRoute = createRoute({
    path: '/admin/:id',
    method: 'put',
    tags: ['Admin'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateAdmin, 'Admin user'),
    },
    responses: {
        [OK]: ApiResponse(zSelectAdminWithoutPassword, 'User admin updated'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const updateAdminUserHandler: AppRouteHandler<
    typeof updateAdminUserRoute
> = async (c) => {
    const user = c.req.valid('json')
    const id = c.req.param('id')

    const exists = await getAdminUserById(id)
    if (!exists) {
        return c.json(
            { data: {}, message: 'Admin not found', success: false },
            NOT_FOUND,
        )
    }

    try {
        // const password =
        //     user.password && user.password !== exists.password
        //         ? await argon2.hash(user.password)
        //         : null

        const password = user.password
            ? await argon2.hash(user.password)
            : exists.password

        const [response] = await updateAdminUser(
            id,
            shake({ ...user, password }),
        )

        return c.json(
            {
                data: { ...response, password: '' },
                success: true,
                message: 'Admin updated',
            },
            OK,
        )
    } catch (error) {
        console.error(
            'Error promoting user to admin:',
            error instanceof Error ? error.message : 'Unknown error',
        )
        c.var.logger.error((error as Error)?.stack ?? error)
        return c.json(
            {
                data: {},
                message: 'Failed to promote user to admin',
                success: false,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}

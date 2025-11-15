import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isAdmin } from '../../../middlewares/is-admin.middleware'
import { ApiResponse } from '../../../utils/api-response.util'
import { zSearchAdmin, zSelectAdminWithoutPassword } from '../admin.schema'
import { getAllAdmins, removeAdminPassword } from '../admin-user.service'

export const getAdminUsersRoute = createRoute({
    path: '/admin',
    method: 'get',
    tags: ['Admin'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        query: zSearchAdmin,
    },
    responses: {
        [OK]: ApiResponse(
            z.array(zSelectAdminWithoutPassword),
            'List of Admin Users',
        ),
    },
})

export const getAdminUsersHandler: AppRouteHandler<
    typeof getAdminUsersRoute
> = async (c) => {
    const { search, page, size, orderBy } = c.req.query()

    const pageNumber = Number(page) || 1
    const limitNumber = Number(size) || 10

    const { data, meta } = await getAllAdmins({
        search,
        page: pageNumber,
        size: limitNumber,
        orderBy,
    })

    const serializedUsers = data.map((user) => {
        const userWithoutPassword = removeAdminPassword(user)
        return {
            ...userWithoutPassword,
            updatedAt: userWithoutPassword?.updatedAt?.toISOString() ?? null,
        }
    })

    return c.json(
        {
            data: serializedUsers,
            pagination: {
                page: meta.page,
                size: meta.size,
                total: meta.totalCount,
            },
            success: true,
            message: 'List of Admin Users',
        },
        OK,
    )
}

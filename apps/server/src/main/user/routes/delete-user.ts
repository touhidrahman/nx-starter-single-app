import { createRoute, z } from '@hono/zod-openapi'
import {
    INTERNAL_SERVER_ERROR,
    NO_CONTENT,
    NOT_FOUND,
    OK,
} from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isAdmin } from '../../../middlewares/is-admin.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import {
    removeGroupOwner,
    resetDefaultGroupId,
} from '../../group/group.service'
import { zSelectUser } from '../user.schema'
import {
    deleteUser,
    findGroupsOwnedByUser,
    findUserById,
    removeAllMembershipsOfUser,
} from '../user.service'

export const deleteUserRoute = createRoute({
    path: '/users/:id',
    method: 'delete',
    tags: ['User'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(zSelectUser, 'Deleted'),
        [NO_CONTENT]: ApiResponse(zEmpty, 'Deleted'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const deleteUserHandler: AppRouteHandler<
    typeof deleteUserRoute
> = async (c) => {
    const { sub } = c.get('jwtPayload')
    const userId = c.req.param('id')
    const user = await findUserById(userId)

    try {
        if (!user) {
            return c.json(
                { data: {}, success: false, message: 'User not found' },
                NOT_FOUND,
            )
        }

        const userGroups = await findGroupsOwnedByUser(user.id)
        if (userGroups.length > 0) {
            for (const group of userGroups) {
                await removeGroupOwner(group.id)
            }
        }
        await removeAllMembershipsOfUser(user.id)
        await resetDefaultGroupId(user?.defaultGroupId ?? '')

        const deletedUser = await deleteUser(userId)

        if (!deletedUser) {
            return c.json(
                { data: {}, success: false, message: 'User not found' },
                NOT_FOUND,
            )
        }

        return c.json(
            {
                data: { ...user, password: '' },
                success: true,
                message: 'User deleted',
            },
            OK,
        )
    } catch (error) {
        return c.json(
            {
                data: {},
                message: 'Failed to delete user',
                success: false,
                error: error,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}

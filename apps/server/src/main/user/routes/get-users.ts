import { createRoute, z } from '@hono/zod-openapi'
import { every } from 'hono/combine'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { ApiResponse } from '../../../utils/api-response.util'
import {
    User,
    UserWithoutPassword,
    zSearchUser,
    zSelectUserWithoutPass,
} from '../user.schema'
import { countUsers, findUsers } from '../user.service'
import { passwordRemoved, validateEnum } from '../user.util'

export const getUsersRoute = createRoute({
    path: '/v1/users',
    method: 'get',
    tags: ['User'],
    middleware: [every(checkToken)] as const,
    request: {
        query: zSearchUser,
    },
    responses: {
        [OK]: ApiResponse(z.array(zSelectUserWithoutPass), 'List of Users'),
    },
})

export const getUsersHandler: AppRouteHandler<typeof getUsersRoute> = async (
    c,
) => {
    const {
        search,
        page,
        size,
        orderBy,
        id,
        email,
        phone,
        firstName,
        lastName,
        city,
        country,
        postCode,
        groupType,
        status,
        level,
    } = c.req.query()

    const pageNumber = Number(page) || 1
    const limitNumber = Number(size) || 10

    // Validate types
    const validatedGroupType = validateEnum(groupType, ['client', 'vendor'])
    const validatedStatus = validateEnum(status, [
        'active',
        'inactive',
        'banned',
    ])
    const validatedLevel = validateEnum(level, ['user', 'moderator', 'admin'])
    const data = (await findUsers({
        search,
        page: pageNumber,
        size: limitNumber,
        orderBy,
        id,
        email,
        phone,
        firstName,
        lastName,
        city,
        country,
        postCode,
        groupType: validatedGroupType,
        status: validatedStatus,
        level: validatedLevel,
    })) as User[]

    const serializedUsers = data.map((user) => {
        const userWithoutPassword = passwordRemoved(user)
        return {
            ...userWithoutPassword,
            status: userWithoutPassword.status ?? undefined,
            updatedAt: userWithoutPassword?.updatedAt?.toISOString() ?? null,
        }
    }) as UserWithoutPassword[]

    const total = await countUsers({ id })

    return c.json(
        {
            data: serializedUsers as UserWithoutPassword[],
            pagination: {
                page: pageNumber,
                size: limitNumber,
                total: total,
            },
            message: 'List of users',
            success: true,
        },
        OK,
    )
}

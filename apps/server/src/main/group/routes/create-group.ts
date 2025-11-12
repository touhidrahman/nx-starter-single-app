import { createRoute } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    CREATED,
    INTERNAL_SERVER_ERROR,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { GroupDto, zInsertGroup, zSelectGroup } from '../group.schema'
import { createGroup, setDefaultGroup } from '../group.service'

export const createGroupRoute = createRoute({
    path: '/v1/groups',
    method: 'post',
    tags: ['Group'],
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(zInsertGroup, 'Group Detail'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectGroup, 'Group created successfully'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid group data'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})
export const createGroupHandler: AppRouteHandler<
    typeof createGroupRoute
> = async (c) => {
    const body = c.req.valid('json') as GroupDto

    const { sub } = await c.get('jwtPayload')

    // const hasOwnedGroup = await isOwner(userId, groupId)
    // if (hasOwnedGroup) {
    //     return c.json(
    //         {
    //             message: 'You already have a group owned by you',
    //             data: {},
    //             success: false,
    //         },
    //         BAD_REQUEST,
    //     )
    // }

    // Insert a new entry into groups
    const [newGroup] = await createGroup({
        ...body,
        ownerId: sub,
    })

    await saveLog(
        'groups',
        newGroup.id,
        sub,
        'create',
        {},
        toJsonSafe(newGroup),
    )

    await setDefaultGroup(sub, newGroup.id)

    return c.json(
        {
            data: newGroup,
            success: true,
            message: 'Group created',
        },
        CREATED,
    )
}

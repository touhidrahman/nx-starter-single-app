import { createRoute } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    CREATED,
    INTERNAL_SERVER_ERROR,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { setDefaultGroupId } from '../../user/user.service'
import { InsertGroup, zInsertGroup, zSelectGroup } from '../group.schema'
import { createGroup } from '../group.service'

export const createGroupRoute = createRoute({
    path: '/groups',
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
    const body = c.req.valid('json') as InsertGroup
    const { sub } = await c.get('jwtPayload')

    const [newGroup] = await createGroup({
        ...body,
        creatorId: sub,
    })

    if (!newGroup) {
        return c.json(
            { data: {}, success: false, message: 'Invalid group data' },
            BAD_REQUEST,
        )
    }

    await saveLog(
        'groups',
        newGroup.id,
        sub,
        'create',
        {},
        toJsonSafe(newGroup),
    )

    await setDefaultGroupId(sub, newGroup.id)

    return c.json(
        {
            data: newGroup,
            success: true,
            message: 'Group created',
        },
        CREATED,
    )
}

import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import { zQueryGroups, zSelectGroup } from '../core/group-core.model'
import { GroupCustomService } from './group-custom.service'

const tags = [APP_OPENAPI_TAGS.Group]
const path = '/custom/groups'

const GetMyGroupListDef = createRoute({
    path: `${path}/my`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        query: zQueryGroups,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectGroup), 'Group List'),
    },
})

const GetGroupListCrud: AppRouteHandler<typeof GetMyGroupListDef> = async (
    c,
) => {
    const query = c.req.valid('query')
    const { sub: creatorId } = c.get('jwtPayload') as AccessTokenPayload

    const data = await GroupCustomService.findMany({ ...query, creatorId })
    const count = await GroupCustomService.count({ ...query, creatorId })

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Group list fetched successfully',
            success: true,
        },
        OK,
    )
}

// const GetGroupMembersDef = createRoute({
//     path: `${path}/:id/members`,
//     tags,
//     method: REQ_METHOD.GET,
//     middleware: [checkToken] as const,
//     request: {
//         params: zId,
//     },
//     responses: {
//         [OK]: ApiListResponse(z.array(zSelectGroup), 'Group List'),
//     },
// })

// const GetGroupMembers: AppRouteHandler<typeof GetGroupMembersDef> = async (
//     c,
// ) => {
//     const params = c.req.valid('param')
//     const { groupId, sub: creatorId } = c.get(
//         'jwtPayload',
//     ) as AccessTokenPayload

//     if (params.id !== groupId) {
//         throw new HTTPException(FORBIDDEN, {
//             message: 'Group members cannot be accessed',
//         })
//     }

//     return c.json(
//         {
//             data,
//             pagination: buildPaginationResponse(
//                 params.page,
//                 params.size,
//                 count,
//             ),
//             message: 'Group members fetched successfully',
//             success: true,
//         },
//         OK,
//     )
// }

export const groupCustomRoutes = createRouter().openapi(
    GetMyGroupListDef,
    GetGroupListCrud,
)

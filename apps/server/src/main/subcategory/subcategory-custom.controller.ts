import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../core/core.type'
import { createRouter } from '../../core/create-app'
import { checkToken } from '../../middlewares/check-token.middleware'
import { ApiListResponse } from '../../utils/api-response.util'
import { buildPaginationResponse } from '../../utils/pagination.util'
import { AccessTokenPayload } from '../auth/auth.model'
import { zQuerySubcategories, zSelectSubcategory } from './subcategory.model'
import { SubcategoryService } from './subcategory.service'

const tags = ['Subcategory']
const path = '/subcategories/custom'

const GetMySubcategoryListDef = createRoute({
    path: `${path}/my`,
    tags,
    method: 'get',
    middleware: [checkToken] as const,
    request: {
        query: zQuerySubcategories,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectSubcategory), 'Subcategory List'),
    },
})

const GetSubcategoryListCrud: AppRouteHandler<typeof GetMySubcategoryListDef> = async (c) => {
    const query = c.req.valid('query')
    const { groupId, sub: creatorId } = c.get('jwtPayload') as AccessTokenPayload

    const groupAndUserSpecificQuery = { ...query, groupId, creatorId }
    const data = await SubcategoryService.findMany(groupAndUserSpecificQuery)
    const count = await SubcategoryService.count(groupAndUserSpecificQuery)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Subcategory list fetched successfully',
            success: true,
        },
        OK,
    )
}

export const subcategoryCustomRoutes = createRouter().openapi(
    GetMySubcategoryListDef,
    GetSubcategoryListCrud,
)

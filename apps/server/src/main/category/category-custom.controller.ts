import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../core/core.type'
import { createRouter } from '../../core/create-app'
import { checkToken } from '../../middlewares/check-token.middleware'
import { ApiListResponse } from '../../utils/api-response.util'
import { buildPaginationResponse } from '../../utils/pagination.util'
import { AccessTokenPayload } from '../auth/auth.model'
import { zQueryCategories, zSelectCategory } from './category.model'
import { CategoryService } from './category.service'

const tags = ['Category']
const path = '/categories/custom'

const GetMyCategoryListDef = createRoute({
    path: `${path}/my`,
    tags,
    method: 'get',
    middleware: [checkToken] as const,
    request: {
        query: zQueryCategories,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectCategory), 'Category List'),
    },
})

const GetCategoryListCrud: AppRouteHandler<typeof GetMyCategoryListDef> = async (c) => {
    const query = c.req.valid('query')
    const { groupId, sub: creatorId } = c.get('jwtPayload') as AccessTokenPayload

    const groupAndUserSpecificQuery = { ...query, groupId, creatorId }
    const data = await CategoryService.findMany(groupAndUserSpecificQuery)
    const count = await CategoryService.count(groupAndUserSpecificQuery)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Category list fetched successfully',
            success: true,
        },
        OK,
    )
}

export const categoryCustomRoutes = createRouter().openapi(
    GetMyCategoryListDef,
    GetCategoryListCrud,
)

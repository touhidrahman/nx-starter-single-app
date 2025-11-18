import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import {
    zQuerySubcategories,
    zSelectSubcategory,
} from '../core/subcategory-core.model'
import { SubcategoryCustomService } from './subcategory-custom.service'

const tags = [APP_OPENAPI_TAGS.Subcategory]
const path = '/custom/subcategories'

const GetMySubcategoryListDef = createRoute({
    path: `${path}/my`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        query: zQuerySubcategories,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectSubcategory), 'Subcategory List'),
    },
})

const GetSubcategoryListCrud: AppRouteHandler<
    typeof GetMySubcategoryListDef
> = async (c) => {
    const query = c.req.valid('query')
    const { groupId, sub: creatorId } = c.get(
        'jwtPayload',
    ) as AccessTokenPayload

    const groupAndUserSpecificQuery = { ...query, groupId, creatorId }
    const data = await SubcategoryCustomService.findMany(
        groupAndUserSpecificQuery,
    )
    const count = await SubcategoryCustomService.count(
        groupAndUserSpecificQuery,
    )

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

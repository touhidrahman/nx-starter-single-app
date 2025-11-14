import { createRoute } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty, zId } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { zSelectStorage } from '../storage.schema'
import { getStorageItemById } from '../storage.service'

export const getStorageItemRoute = createRoute({
    path: '/v1/storage/:id',
    tags: ['Storage'],
    method: 'get',
    middleware: [checkToken] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectStorage, 'Storage Item'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Storage not found!'),
    },
})

export const getStorageItemHandler: AppRouteHandler<
    typeof getStorageItemRoute
> = async (c) => {
    const id = c.req.param('id')

    const storage = await getStorageItemById(id)

    if (!storage) {
        return c.json(
            { data: {}, message: 'Storage not found', success: false },
            NOT_FOUND,
        )
    }

    return c.json({ data: storage, message: 'Storage item', success: true }, OK)
}

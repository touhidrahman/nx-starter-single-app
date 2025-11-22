import { createRoute } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty, zId } from '../../../models/common.schema'
import { deleteS3File } from '../../../third-party/s3.service'
import { ApiResponse } from '../../../utils/api-response.util'
import { getFileNameFromUrl } from '../../../utils/file.util'
import { zSelectStorage } from '../storage.schema'
import { deleteStorageItemById, getStorageItemById } from '../storage.service'

export const deleteStorageItemRoute = createRoute({
    path: '/storage/:id',
    tags: ['Storage'],
    method: 'delete',
    middleware: [checkToken] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectStorage, 'Deleted Storage Item'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Storage not found!'),
        // [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Server error'),
    },
})

export const deleteStorageItemHandler: AppRouteHandler<
    typeof deleteStorageItemRoute
> = async (c) => {
    const id = c.req.param('id')
    const { sub } = c.get('jwtPayload')
    const storage = await getStorageItemById(id)

    if (!storage) {
        return c.json(
            { data: {}, message: 'Storage not found', success: false },
            NOT_FOUND,
        )
    }

    const fileKey = getFileNameFromUrl(storage.url ?? '')
    if (fileKey) {
        await deleteS3File(fileKey)
    }
    const res = await deleteStorageItemById(id)

    return c.json(
        { data: storage, message: 'Storage item deleted', success: true },
        OK,
    )
}

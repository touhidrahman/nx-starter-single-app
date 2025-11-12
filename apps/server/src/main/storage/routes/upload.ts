import { createRoute, z } from '@hono/zod-openapi'
import { CREATED } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { uploadToS3AndGetUrl } from '../../../core/third-party/s3.service'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import {
    SelectStorage,
    zInsertStorage,
    zUploadStorage,
} from '../storage.schema'
import { createStorageRecord } from '../storage.service'

export const uploadRoute = createRoute({
    path: '/v1/storage/upload',
    tags: ['Storage'],
    method: 'post',
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(zUploadStorage, 'Storage Item'),
    },
    responses: {
        [CREATED]: ApiResponse(
            z.array(zInsertStorage),
            'Storage Item(s) uploaded',
        ),
    },
})

export const uploadHandler: AppRouteHandler<typeof uploadRoute> = async (c) => {
    const body = await c.req.parseBody({ all: true })
    const payload = c.get('jwtPayload')
    const fileOrFiles = body['file']
    const entityName = body.entityName as string
    const results: SelectStorage[] = []

    if (Array.isArray(fileOrFiles)) {
        for await (const f of fileOrFiles) {
            const file = f as File
            const url = await uploadToS3AndGetUrl(file)
            const [item] = await createStorageRecord({
                file,
                url,
                entityName,
                groupId: payload.groupId,
                uploadedBy: payload.sub,
            })
            results.push(item)
        }
    } else {
        const file = fileOrFiles as File
        const url = await uploadToS3AndGetUrl(file)
        const [item] = await createStorageRecord({
            file,
            url,
            entityName,
            groupId: payload.groupId,
            uploadedBy: payload.sub,
        })
        results.push(item)
    }

    for (const item of results) {
        await saveLog(
            'storage',
            item.id,
            payload.sub,
            'create',
            {},
            toJsonSafe(item),
        )
    }

    return c.json(
        { data: results, message: 'Files uploaded', success: true },
        CREATED,
    )
}

import { createRoute, z } from '@hono/zod-openapi'
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isAdmin } from '../../../middlewares/is-admin.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { downloadBackupFile, findBackupFileByName } from '../database-backup.service'

export const downloadDatabaseBackupRoute = createRoute({
    path: '/database-backup/:fileName/download',
    method: 'get',
    tags: ['Backup Database'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        params: z.object({
            fileName: z.string().describe('Name of the backup file to download'),
        }),
    },
    responses: {
        [OK]: {
            description: 'Backup file download',
            content: {
                'application/octet-stream': {
                    schema: z.any(),
                },
            },
        },
        [BAD_REQUEST]: ApiResponse(zEmpty, 'no backup'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const downloadDatabaseBackupHandler: AppRouteHandler<
    typeof downloadDatabaseBackupRoute
> = async (c) => {
    try {
        const { fileName } = c.req.param()

        const backupExists = await findBackupFileByName(fileName)
        if (!backupExists) {
            return c.json(
                {
                    data: {},
                    message: `Backup file "${fileName}" not found`,
                    success: false,
                    error: `Backup file "${fileName}" not found`,
                    meta: null,
                },
                BAD_REQUEST,
            )
        }

        const backupData = await downloadBackupFile(fileName)

        const fileData = new Uint8Array(backupData)
        return new Response(fileData, {
            status: OK,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Content-Length': backupData.length.toString(),
            },
        })
    } catch (error) {
        console.error('Download error:', error)
        return c.json(
            {
                data: {},
                message: 'Failed to download backup',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}

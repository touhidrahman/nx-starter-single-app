import { createRoute, z } from '@hono/zod-openapi'
import { INTERNAL_SERVER_ERROR, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../../core/middlewares/is-admin.middleware'
import { zEmptyList } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zDdBackupRecord } from '../database-backup.schema'
import { listDatabaseBackups } from '../database-backup.service'

export const getDatabaseBackupListRoute = createRoute({
    path: '/v1/database-backup',
    method: 'get',
    tags: ['Backup Database'],
    middleware: [checkToken, isAdmin] as const,

    responses: {
        [OK]: ApiResponse(z.array(zDdBackupRecord), 'List of database backups'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(
            zEmptyList,
            'Internal server error',
        ),
    },
})

export const getDatabaseBackupListHandler: AppRouteHandler<
    typeof getDatabaseBackupListRoute
> = async (c) => {
    try {
        const backupList = await listDatabaseBackups()

        return c.json(
            {
                data: backupList,
                message: 'List of database backups',
                success: true,
                error: null,
                meta: null,
            },
            OK,
        )
    } catch (error) {
        return c.json(
            {
                data: [],
                message: 'Internal server error',
                success: false,
                error,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}

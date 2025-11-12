import { createRouter } from '../../core/create-app'
import {
    downloadDatabaseBackupHandler,
    downloadDatabaseBackupRoute,
} from './routes/download-database-backup'
import {
    getDatabaseBackupListHandler,
    getDatabaseBackupListRoute,
} from './routes/get-database-backup-list'

export const databaseBackupV1Routes = createRouter()
    .openapi(downloadDatabaseBackupRoute, downloadDatabaseBackupHandler)
    .openapi(getDatabaseBackupListRoute, getDatabaseBackupListHandler)

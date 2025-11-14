import { createDatabaseBackup } from '../../main/database-backup/database-backup.service'

async function weeklyDatabaseBackup() {
    try {
        await createDatabaseBackup()
    } catch (error) {
        console.error(
            '❌ Weekly backup failed:',
            error instanceof Error ? error.message : 'Unknown error',
        )

        process.exit(1)
    }
}

;(async () => {
    await weeklyDatabaseBackup()
})()

import { removeBackups } from '../../main/database-backup/database-backup.service'

async function removeSixMonthOldBackups() {
    try {
        await removeBackups()
    } catch (error) {
        console.error(
            '❌ Monthly cleanup failed:',
            error instanceof Error ? error.message : 'Unknown error',
        )
        throw error
    }
}

;(async () => {
    await removeSixMonthOldBackups()
})()

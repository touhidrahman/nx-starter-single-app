import { db } from '../db/db' // Your Drizzle database instance
import { meiliClient, meilisearchPolling } from '../utils/meilisearch'

export async function syncCourtsToMeilisearch() {
    try {
        // Pull all courts from PostgreSQL
        const courts = await db.query.courtsTable.findMany()
        const courtsIndex = await meiliClient
            .index('courts')
            .addDocuments(courts)

        // Manually poll the task until it's finished
        await meilisearchPolling(courtsIndex.taskUid)
    } catch (error) {
        console.error('❌ Failed to sync courts to Meilisearch:', error)
        throw error
    }
}

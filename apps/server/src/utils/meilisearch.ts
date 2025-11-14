import { MeiliSearch, Task } from 'meilisearch'
import env from '../env'

export const meiliClient = new MeiliSearch({
    host: env.MEILISEARCH_API_URL,
    apiKey: env.MEILISEARCH_API_KEY,
})

export const meilisearchPolling = async (taskUid: number) => {
    let task: Task

    do {
        task = await meiliClient.tasks.getTask(taskUid)
        console.log('⏳ Indexing status:', task.status)

        await new Promise((res) => setTimeout(res, 1000)) // wait 1s
    } while (task.status !== 'succeeded' && task.status !== 'failed')

    task.status === 'failed'
        ? console.error('❌ Indexing failed:', task.error)
        : console.log('✅ Courts indexed successfully!')
}

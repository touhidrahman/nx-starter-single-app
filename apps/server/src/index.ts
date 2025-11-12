// server.ts
import 'dotenv/config' // Must be first
import { serve } from '@hono/node-server'
import { showRoutes } from 'hono/dev'
import app from './app'
import { startJobRunner } from './core/cron-jobs/bree'
import env from './env'

const logRoutesToConsole = false
if (env.NODE_ENV !== 'production' && logRoutesToConsole) {
    showRoutes(app, { verbose: true })
}

// Start Hono server
serve({
    fetch: app.fetch,
    port: env.PORT,
})

;(async () => {
    try {
        // Start your cron jobs
        await startJobRunner()

        console.log(`🚀 Server running at http://localhost:${env.PORT}`)
    } catch (err) {
        console.error('❌ Meilisearch initialization failed:', err)
    }
})()

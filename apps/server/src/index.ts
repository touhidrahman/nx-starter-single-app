import 'dotenv/config' // Must be first

import { serve } from '@hono/node-server'
import { showRoutes } from 'hono/dev'
import app from './app'
import env from './env'

const logRoutesToConsole = false
if (env.NODE_ENV !== 'production' && logRoutesToConsole) {
    showRoutes(app, { verbose: true })
}

;(async () => {
    try {
        // Start Hono server
        serve({
            fetch: app.fetch,
            port: env.PORT,
        })

        // Start cron jobs

        console.log(`🚀 Server running at http://localhost:${env.PORT}`)
    } catch (err) {
        console.error('❌ Server initialization failed:', err)
    }
})()

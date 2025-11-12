import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config()

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined in the environment variables.')
}

// const pathToEnv = join(__dirname, '.env')

// config({
//     path: pathToEnv,
//     debug: true,
// })

// const pathToSchema = join(__dirname, 'src/core/db/schema/*')
// const pathToMigrations = join(__dirname, 'migrations')

export default defineConfig({
    dialect: 'postgresql',
    dbCredentials: {
        url: dbUrl,
    },
    schema: './src/core/db/schema',
    out: './src/core/db/migrations',
    verbose: process.env.NODE_ENV === 'production',
    strict: true,
    casing: 'snake_case',
    migrations: {
        schema: 'public',
    },
})

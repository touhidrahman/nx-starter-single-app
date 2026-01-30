import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
import { drizzle as drizzleForNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzleForPg } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { relations } from './relations'

config({ path: '.env' })

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined')
}

const dbConnMode = process.env.DB_MODE || 'pg'
const isNeonMode = dbConnMode === 'neon'
console.log(`Database connection mode: ${dbConnMode}`)
console.log(`Database URL: ${dbUrl.split('@')[1]}`)

export const db = isNeonMode
    ? drizzleForNeon({ client: neon(dbUrl), relations, casing: 'snake_case', logger: false })
    : drizzleForPg({
          client: new Pool({ connectionString: dbUrl }),
          relations,
          casing: 'snake_case',
          logger: false,
      })

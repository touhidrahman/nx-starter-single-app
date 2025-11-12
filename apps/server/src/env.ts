import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import { z } from 'zod'

expand(config())

const EnvSchema = z.object({
    NODE_ENV: z.string(),
    SHOW_SWAGGER_DOCS: z.enum(['true', 'false']).optional(),
    LOG_LEVEL: z
        .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
        .optional()
        .default('info'),
    PORT: z.coerce.number(),
    DATABASE_URL: z.string(),
    FRONTEND_URL: z.string(),
    BACKEND_URL: z.string(),
    DB_MODE: z.enum(['pg', 'neon']),
    ACCESS_TOKEN_SECRET: z.string(),
    REFRESH_TOKEN_SECRET: z.string(),
    INVITE_TOKEN_SECRET_KEY: z.string(),
    S3_ACCESS_KEY: z.string(),
    S3_SECRET_KEY: z.string(),
    S3_BUCKET_URL: z.string(),
    S3_BUCKET: z.string(),
    S3_REGION: z.string(),
    S3_ENDPOINT: z.string(),
    EMAIL_RESEND_API_KEY: z.string(),
    EMAIL_SENDER_NAME: z.string(),
    EMAIL_SENDER_EMAIL: z.string(),
    /** Developer's email that was used to create resend account */
    EMAIL_TEST_EMAIL: z.string().optional(),
    // MEILISEARCH_API_KEY: z.string(),
    // MEILISEARCH_API_URL: z.string(),
})

export type TEnv = z.infer<typeof EnvSchema>

let env: TEnv

try {
    env = EnvSchema.parse(process.env)
} catch (error) {
    console.error('❌ Invalid env:')
    console.error(z.treeifyError(error as any))
    z.treeifyError(error as any)
    process.exit(1)
}

env = EnvSchema.parse(process.env)

export default env

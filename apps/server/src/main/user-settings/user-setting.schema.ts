import { createSelectSchema } from 'drizzle-zod'
import z from 'zod'
import { usersSettingsTable } from '../../core/db/schema'

export const zSelectUserSettings =
    createSelectSchema(usersSettingsTable).partial()
export const zUpdateUserSettings = z.record(z.string(), z.string())

export const zUserSettings = z.object({
    settings: z.record(z.string(), z.string()),
})
export type UserSettings = z.infer<typeof zUserSettings>

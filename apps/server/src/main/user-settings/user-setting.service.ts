import { eq } from 'drizzle-orm'
import z from 'zod'
import { db } from '../../core/db/db'
import { usersSettingsTable } from '../../core/db/schema'
import { zSelectUserSettings } from './user-setting.schema'

export type UserSetting = z.infer<typeof zSelectUserSettings>

export const findUserSettingsByUserId = async (
    userId: string,
): Promise<UserSetting[]> => {
    return db.query.usersSettingsTable.findMany({
        where: eq(usersSettingsTable.userId, userId),
    })
}

export async function upsertUserSetting(
    userId: string,
    data: Record<string, string>,
): Promise<UserSetting[]> {
    const entries = Object.entries(data)

    if (entries.length === 0) {
        throw new Error('No values to update')
    }

    const results = await Promise.all(
        entries.map(([key, value]) =>
            db
                .insert(usersSettingsTable)
                .values({ userId, key, value })
                .onConflictDoUpdate({
                    target: [usersSettingsTable.userId, usersSettingsTable.key],
                    set: { value },
                })
                .returning(),
        ),
    )

    return results.flat()
}

import { and, eq } from 'drizzle-orm'
import { db } from '../../core/db/db'
import { usersSettingsTable } from '../../core/db/schema'
import { UserSettings } from './user-setting.schema'

export const findUserSettings = async (userId: string, key: string) => {
    return db.query.usersSettingsTable.findFirst({
        where: and(
            eq(usersSettingsTable.userId, userId),
            eq(usersSettingsTable.key, key),
        ),
    })
}

export const findUserSettingsByUserId = async (
    userId: string,
): Promise<UserSettings[]> => {
    return db.query.usersSettingsTable.findMany({
        where: eq(usersSettingsTable.userId, userId),
    })
}

export async function upsertUserSetting(
    userId: string,
    data: Record<string, string>,
): Promise<UserSettings[]> {
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

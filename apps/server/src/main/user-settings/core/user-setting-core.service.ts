import { and, eq, ilike, or, SQL, sql } from 'drizzle-orm'
import { db } from '../../../db/db'
import { usersSettingsTable } from '../../../db/schema'
import { DEFAULT_PAGE_SIZE } from '../../../models/common.values'
import {
    InsertUserSetting,
    QueryUserSettings,
    SelectUserSetting,
} from './user-setting-core.model'

export class UserSettingCoreService {
    static async findMany(
        filters: QueryUserSettings,
    ): Promise<SelectUserSetting[]> {
        const conditions = UserSettingCoreService.buildWhereConditions(filters)
        const size = filters.size || DEFAULT_PAGE_SIZE
        const offset = ((filters.page || 1) - 1) * size
        const userSettings = await db
            .select()
            .from(usersSettingsTable)
            .where(conditions)
            .offset(offset)
            .limit(size)
        return userSettings
    }

    static async findOne(
        filters: QueryUserSettings,
    ): Promise<SelectUserSetting | null> {
        const conditions = UserSettingCoreService.buildWhereConditions(filters)
        const userSettings = await db
            .select()
            .from(usersSettingsTable)
            .where(conditions)
            .limit(1)
        return userSettings[0] ?? null
    }

    static async findByUserIdAndKey(
        userId: string,
        key: string,
    ): Promise<SelectUserSetting | null> {
        const userSetting = await db
            .select()
            .from(usersSettingsTable)
            .where(
                and(
                    eq(usersSettingsTable.userId, userId),
                    eq(usersSettingsTable.key, key),
                ),
            )
            .limit(1)
        return userSetting[0] || null
    }

    static async exists(userId: string, key: string): Promise<boolean> {
        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(usersSettingsTable)
            .where(
                and(
                    eq(usersSettingsTable.userId, userId),
                    eq(usersSettingsTable.key, key),
                ),
            )
        const count = countResult[0]?.count || 0
        return count > 0
    }

    static async count(filters: QueryUserSettings): Promise<number> {
        const conditions = UserSettingCoreService.buildWhereConditions(filters)

        const [{ count }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(usersSettingsTable)
            .where(conditions)
        return count
    }

    static async create(input: InsertUserSetting): Promise<SelectUserSetting> {
        const [userSetting] = await db
            .insert(usersSettingsTable)
            .values(input)
            .returning()
        return userSetting
    }

    static async createMany(
        inputs: InsertUserSetting[],
    ): Promise<SelectUserSetting[]> {
        const userSettings = await db
            .insert(usersSettingsTable)
            .values(inputs)
            .returning()
        return userSettings
    }

    static async update(
        userId: string,
        key: string,
        input: Partial<InsertUserSetting>,
    ): Promise<SelectUserSetting> {
        const [userSetting] = await db
            .update(usersSettingsTable)
            .set(input)
            .where(
                and(
                    eq(usersSettingsTable.userId, userId),
                    eq(usersSettingsTable.key, key),
                ),
            )
            .returning()
        return userSetting
    }

    static async upsert(
        userId: string,
        key: string,
        input: InsertUserSetting,
    ): Promise<SelectUserSetting> {
        const existing = await UserSettingCoreService.findByUserIdAndKey(
            userId,
            key,
        )
        if (existing) {
            return UserSettingCoreService.update(userId, key, input)
        }
        return UserSettingCoreService.create(input)
    }

    static async delete(userId: string, key: string): Promise<void> {
        await db
            .delete(usersSettingsTable)
            .where(
                and(
                    eq(usersSettingsTable.userId, userId),
                    eq(usersSettingsTable.key, key),
                ),
            )
    }

    static async deleteByUserId(userId: string): Promise<void> {
        await db
            .delete(usersSettingsTable)
            .where(eq(usersSettingsTable.userId, userId))
    }

    static buildWhereConditions(
        params: QueryUserSettings,
    ): SQL<unknown> | undefined {
        const conditions: (SQL<unknown> | undefined)[] = []

        if (params.search) {
            const searchTerm = `%${params.search.trim()}%`
            conditions.push(
                or(
                    ilike(usersSettingsTable.key, searchTerm),
                    ilike(usersSettingsTable.value, searchTerm),
                ),
            )
        }
        if (params.userId) {
            conditions.push(eq(usersSettingsTable.userId, params.userId))
        }
        if (params.key) {
            conditions.push(eq(usersSettingsTable.key, params.key))
        }
        if (conditions.length === 0) {
            return undefined
        }
        return and(...conditions)
    }
}

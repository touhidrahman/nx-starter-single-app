import { z } from 'zod'
import { usersSettingsTable } from '../../../db/schema'
import { zPagination, zSearch } from '../../../models/common.schema'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from '../../../utils/zod.util'

export type InsertUserSetting = z.infer<typeof zInsertUserSetting>
export type SelectUserSetting = z.infer<typeof zSelectUserSetting>
export type UpdateUserSetting = z.infer<typeof zUpdateUserSetting>
export type QueryUserSettings = z.infer<typeof zQueryUserSettings>

export const zInsertUserSetting = createInsertSchema(usersSettingsTable)
export const zSelectUserSetting = createSelectSchema(usersSettingsTable)
export const zUpdateUserSetting = createUpdateSchema(usersSettingsTable)
export const zQueryUserSettings = zInsertUserSetting
    .extend(zSearch.shape)
    .extend(zPagination.shape)
    .partial()

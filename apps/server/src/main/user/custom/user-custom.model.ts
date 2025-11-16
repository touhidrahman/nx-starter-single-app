import z from 'zod'
import { zSelectGroup } from '../../group/group.schema'
import { zSelectRole } from '../../role/role.schema'
import { zSelectUser } from '../core/user-core.model'

export const zUserLogin = z.object({
    username: z.string(),
    password: z.string().min(6).max(64),
})

export const zUserLoginResponse = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: zSelectUser,
    group: zSelectGroup.optional(),
    role: zSelectRole.optional(),
    lastLogin: z.string().optional(),
})

export type UserLogin = z.infer<typeof zUserLogin>
export type UserLoginResponse = z.infer<typeof zUserLoginResponse>

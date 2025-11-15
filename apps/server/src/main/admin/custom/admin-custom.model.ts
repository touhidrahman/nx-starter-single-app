import { z } from 'zod'
import { zSelectAdmin } from '../core/admin-core.model'

export const zRegisterAdmin = z.object({
    name: z.string().min(1).max(100),
    email: z.email().max(255),
    password: z.string().min(8).max(64),
})

export const zLoginAdmin = z.object({
    email: z.email().max(255),
    password: z.string().min(8).max(64),
})

export const zAdminLoginResponse = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    lastLogin: z.string(),
    admin: zSelectAdmin,
})

export type RegisterAdmin = z.infer<typeof zRegisterAdmin>
export type LoginAdmin = z.infer<typeof zLoginAdmin>
export type AdminLoginResponse = z.infer<typeof zAdminLoginResponse>

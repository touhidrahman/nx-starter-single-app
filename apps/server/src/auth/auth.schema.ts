import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { usersTable } from '../db/schema'
import { SelectGroup } from '../main/group/group.schema'
import { SelectRole } from '../main/role/role.schema'

export const zLogin = z.object({
    username: z.string(),
    password: z.string(),
})

export const zPassword = z.string().min(8).max(64)

export const zRegister = z.object({
    username: z
        .string()
        .min(3, { message: 'Username must be at least 3 characters' }),
    email: z.string().optional(),
    password: zPassword,
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    phone: z.string().optional(),
    referralCode: z.string().optional(),
    organization: z.string().optional(),
})

export const zAcceptInvite = z.object({
    username: z
        .string()
        .min(3, { message: 'Username must be at least 3 characters' }),
    password: zPassword,
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    token: z.string(),
})

export const zChangePassword = z.object({
    userId: z.string(),
    currentPassword: z.string(),
    password: zPassword,
})

export const zForgotPassword = z.object({
    email: z.string().email(),
})

export const zResetPassword = z.object({
    email: z.string(),
    password: zPassword,
})

export const zInsertAuthUser = createInsertSchema(usersTable)
export const zSelectAuthUser = createSelectSchema(usersTable)

export type SelectUser = z.infer<typeof zSelectAuthUser>

export type InsertUser = z.infer<typeof zInsertAuthUser>

export const zUpdateAuthUser = zInsertAuthUser.omit({
    email: true,
    password: true,
    id: true,
    verified: true,
})

export interface SMSResponse {
    success: boolean
    messageId?: string
    error?: string
}

export interface TokenContext {
    group?: SelectGroup
    role?: SelectRole
}
export const zUserVerificationStatus = z.object({
    exists: z.boolean(),
    isVerified: z.boolean(),
    canVerify: z.boolean(),
    isEmail: z.boolean(),
})

export const zUserIdentifier = z.object({ identifier: z.string().max(100) })

export interface CountdownValidationResult {
    allowed: boolean
    remainingTime?: number // in minutes
    message?: string
}

export const zAdminPayload = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string().nullable(),
    username: z.string(),
    status: z.string(),
})

export interface TokenCreateUserData {
    firstName: string
    lastName: string
    username: string
    id: string
}

export const CreateUserSchema = z.object({
    username: z.string().min(3),
    email: z
        .string()
        .refine((val) => val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
            message: 'Invalid email address',
        })
        .optional()
        .nullable(),
    phone: z.string().optional().nullable(),
    password: z.string().min(8).max(32),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    verified: z.boolean().default(false),
})

export const UserCreateResult = zInsertAuthUser
    .extend({
        id: z.string(),
        email: z.string().nullable(),
    })
    .omit({ password: true })

export const zInactiveUsers = z.object({
    inactiveForDays: z.number().min(1),
    lastEmailElapsedDays: z.number().min(0),
})

export type InactiveUser = Omit<z.infer<typeof zInactiveUsers>, 'phone'>

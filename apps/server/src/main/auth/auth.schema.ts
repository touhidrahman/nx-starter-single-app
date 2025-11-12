import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { usersTable } from '../../core/db/schema'
import { Group } from '../group/group.schema'
import { SelectRole } from '../role/role.schema'

export const zLogin = z.object({
    identifier: z.string(),
    password: z.string(),
})

export const zRegister = z.object({
    email: z.string().optional(),
    password: z.string(),
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    defaultGroupId: z
        .string()
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
    role: z
        .string()
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
    phone: z.string().optional(),
    acceptTerms: z.boolean().optional(),
    referralCode: z.string().optional(),
    organization: z.object({
        name: z.string().optional(),
        groupType: z.enum(['client', 'vendor']),
    }),
})

export const zChangePassword = z.object({
    userId: z.string(),
    currentPassword: z.string(),
    password: z.string().min(8).max(32), //TODO : password validation same as front-end
})

export const zForgotPassword = z.object({
    email: z.string().email(),
})

export const zResetPassword = z.object({
    email: z.string(),
    phone: z.string(),
    code: z.string().optional(),
    password: z.string().min(8).max(32), //TODO : password validation same as front-end
})

export const zInsertAuthUser = createInsertSchema(usersTable, {
    email: (schema) => schema.email(),
})

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
    group?: Group
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
    email: string | null
    phone: string | null
    username: string
    id: string
    status: 'active' | 'inactive' | 'banned'
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

export const UserCreateResult = CreateUserSchema.extend({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
}).omit({ password: true })

export const zInactiveUsers = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string(),
})

export type InactiveUser = Omit<z.infer<typeof zInactiveUsers>, 'phone'>

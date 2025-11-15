import { z } from 'zod'
import { SelectGroup } from '../group/group.schema'
import { SelectRole } from '../role/role.schema'
import { zInactiveUsers, zInsertAuthUser, zSelectAuthUser } from './auth.zod'

export type SelectUser = z.infer<typeof zSelectAuthUser>

export type InsertUser = z.infer<typeof zInsertAuthUser>

export interface SMSResponse {
    success: boolean
    messageId?: string
    error?: string
}

export interface TokenContext {
    group?: SelectGroup
    role?: SelectRole
}

export interface CountdownValidationResult {
    allowed: boolean
    remainingTime?: number // in minutes
    message?: string
}

export interface TokenCreateUserData {
    firstName: string
    lastName: string
    username: string
    id: string
}

export type InactiveUser = Omit<z.infer<typeof zInactiveUsers>, 'phone'>

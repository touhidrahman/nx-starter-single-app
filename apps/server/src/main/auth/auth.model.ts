import { z } from 'zod'
import { SystemUserLevel } from '../../core/core.type'
import { SelectGroup } from '../group/group.schema'
import { SelectRole } from '../role/role.schema'
import { zInactiveUsers, zUserLogin, zUserLoginResponse } from './auth.zod'

export type UserLogin = z.infer<typeof zUserLogin>
export type UserLoginResponse = z.infer<typeof zUserLoginResponse>

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

export type AccessTokenPayload = {
    firstName: string
    lastName: string
    username: string
    level: SystemUserLevel
    roleId?: string
    groupId?: string
    sub: string // userId
    exp: number
}

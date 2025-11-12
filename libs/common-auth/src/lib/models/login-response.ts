import { Role } from '@repo/role-permission'
import { User } from '@repo/user'
import { Group } from './group'

export interface LoginResponse {
    lastLogin: Date
    expiresIn: Date
    refreshToken: string
    accessToken: string
    user: User
    group?: Group
    role?: Role
}

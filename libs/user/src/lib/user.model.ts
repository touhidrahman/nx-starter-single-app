import { LabelValuePair } from '@repo/common-models'
import { UserLevel } from './user-role.model'

export interface Creator {
    id: string
    email: string | null
    firstName: string
    lastName: string
    profilePhoto: string | null
}

export interface UserProfile {
    id: string
    email: string
    firstName: string
    lastName: string
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BANNED = 'banned',
}

export interface UserDto {
    id: string
    email: string
    firstName: string
    lastName: string
    coverPhoto?: string
    profilePhoto?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    country?: string
    postCode?: string
    url?: string
    bio?: string
    groupId: string
    groupType: string
    level: UserLevel
    status: UserStatus
    verified: boolean
    defaultGroupId: string | null
    roleName: string
}

export interface User extends UserDto {
    id: string
    createdAt: Date
    updatedAt: Date
}
export interface AdminUserDto {
    id: string
    name: string
    email: string
    level: UserLevel
    status: UserStatus
    verified: boolean
}
export interface AdminUser {
    id: string
    name: string
    email: string
    level: UserLevel
    status: UserStatus
    verified: boolean
    createdAt: Date
    updatedAt: Date
}

export interface UpdateUser {
    firstName: string
    lastName: string
    profilePhoto?: string
    phone?: string
    city?: string
    state?: string
    country?: string
    postCode?: string
    address?: string
}

export interface UserWithOrganization extends User {
    groupName?: string
}

export interface UserResponse {
    userId: string
    registeredBy: string
    token?: string
}

export interface Column {
    field: string
    header: string
}

export interface UserTableColumns {
    id: number
    firstName: string
    lastName: string
    username: string
    email: string
    phone: string
    groupName: string
    city: string
    verified: boolean
    status: string
}

export const USER_STATUS_OPTIONS: LabelValuePair<UserStatus>[] = [
    { label: 'Active', value: UserStatus.ACTIVE },
    { label: 'Inactive', value: UserStatus.INACTIVE },
    { label: 'Banned', value: UserStatus.BANNED },
]

export const USER_VERIFICATION_OPTIONS: LabelValuePair<boolean>[] = [
    { label: 'Verified', value: true },
    { label: 'Not Verified', value: false },
]

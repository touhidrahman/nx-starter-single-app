import { GroupStatus, GroupType } from '@repo/common-auth'
import { UserLevel, UserStatus } from '@repo/user'

export type AccessTokenPayload = {
    firstName: string
    lastName: string
    email: string
    level: UserLevel
    roleId: string
    groupId: string
    groupType: GroupType
    groupStatus: GroupStatus
    status: UserStatus
    sub: string
    exp: number
    groupOwnerCount: number
}
export type AdminAccessTokenPayload = {
    name: string
    email: string
    level: UserLevel
    sub: string
    exp: number
}

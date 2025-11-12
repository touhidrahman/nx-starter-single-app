export interface PermissionRequestDto {
    claim: string
    roleId: string
    groupId: string
    isApproved?: boolean
    isRead?: boolean
    approverId?: string
    creatorId?: string
}

export interface PermissionRequest extends PermissionRequestDto {
    id: string
    user: string
    role: string
    group: string
    createdAt: Date
    updatedAt: Date
}

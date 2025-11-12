export interface RoleDto {
    name: string
    description: string
    groupId: string
    claims: string[]
    isSystemRole: boolean
}

export interface Role extends RoleDto {
    id: string
}

export type RoleFormDialogData = {
    role: RoleDto | null
    groupId?: string
}

export type RoleFormDialogResult = {
    role: Role | null
}

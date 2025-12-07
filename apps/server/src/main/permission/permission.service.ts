import { DEFAULT_PERMISSIONS, GroupOwner } from '../claim/claims'

export class PermissionService {
    static getAvailablePermissions(): string[] {
        return DEFAULT_PERMISSIONS.map((p) => p.id)
    }

    static getOwnerDefaultPermissions(): string[] {
        return DEFAULT_PERMISSIONS.filter((p) => p.forRoles.includes(GroupOwner))
            .map((p) => p.id)
            .map((id) => PermissionService.getEnabledPermissionString(id))
            .sort()
    }

    static getMemberDefaultPermissions(): string[] {
        return DEFAULT_PERMISSIONS.filter((p) => p.forRoles.includes(GroupOwner))
            .map((p) => p.id)
            .map((id) => PermissionService.getEnabledPermissionString(id))
            .sort()
    }

    static getEnabledPermissionString(permissionId: string): string {
        return `${permissionId}|1`
    }

    static getDisabledPermissionString(permissionId: string): string {
        return `${permissionId}|0`
    }

    static upsertAvailablePermissions(existingPermissions: string[]): string[] {
        const availablePermissions = PermissionService.getAvailablePermissions()
        const updatedPermissions: string[] = []
        for (const permission of availablePermissions) {
            const existingPermission = existingPermissions.find((p) =>
                p.startsWith(`${permission}|`),
            )
            if (!existingPermission) {
                // add disabled permission by default
                updatedPermissions.push(PermissionService.getDisabledPermissionString(permission))
            } else {
                updatedPermissions.push(existingPermission)
            }
        }
        return updatedPermissions.sort()
    }
}

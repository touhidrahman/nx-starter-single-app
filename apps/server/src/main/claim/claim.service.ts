import { uniq } from 'es-toolkit'
import { SelectClaim } from './claim.schema'
import { CLAIMS_LIST } from './claims'

export function findAllClaims(): SelectClaim[] {
    return CLAIMS_LIST.map((claim) => {
        return {
            id: claim.id,
            description: claim.description,
            section: claim.section,
            forRoles: claim.forRoles,
            groupType: claim.groupType,
        }
    }).sort((a, b) => {
        if (a.id < b.id) return -1
        if (a.id > b.id) return 1
        return a.id.localeCompare(b.id)
    })
}

export function findAllClaimsByGroupType(
    groupType?: 'vendor' | 'client',
): SelectClaim[] {
    return findAllClaims().filter((claim) => claim.groupType === groupType)
}

export function findAllClaimsList(): string[] {
    return findAllClaims().map((claim) => claim.id.trim().toLowerCase())
}

export function getDefaultClaims(
    role: string,
    groupType: 'vendor' | 'client',
): string[] {
    return uniq(
        CLAIMS_LIST.filter(
            (claim) =>
                claim.forRoles.includes(role) && claim.groupType === groupType,
        ).map((claim) => claim.id),
    ).sort()
}

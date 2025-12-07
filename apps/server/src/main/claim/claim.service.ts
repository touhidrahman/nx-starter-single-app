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
        }
    }).sort((a, b) => {
        if (a.id < b.id) return -1
        if (a.id > b.id) return 1
        return a.id.localeCompare(b.id)
    })
}

export function findAllClaimsList(): string[] {
    return findAllClaims().map((claim) => claim.id.trim().toLowerCase())
}

export function getDefaultClaims(role: string): string[] {
    return uniq(
        CLAIMS_LIST.filter((claim) => claim.forRoles.includes(role)).map((claim) => claim.id),
    ).sort()
}

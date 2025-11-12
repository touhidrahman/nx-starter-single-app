export interface Claim {
    id: string
    description: string
    section: string
    groupType: 'vendor' | 'client'
    forRoles: string[]
}

export type ClaimFormDialogData = {
    claim: Claim | null
}

export type ClaimFormDialogResult = {
    claim: Claim | null
    isEdit: boolean
}

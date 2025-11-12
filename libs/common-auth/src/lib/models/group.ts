export enum GroupType {
    client = 'client',
    vendor = 'vendor',
}
export enum GroupStatus {
    active = 'active',
    inactive = 'inactive',
    pending = 'pending',
}

export type GroupInput = {
    name: string
    address?: string
    city?: string
    phone?: string
    postCode?: string
    state?: string
    type?: GroupType
    status?: GroupStatus
    email?: string
    country?: string
}

export type Group = GroupInput & {
    id: string
    type: GroupType
    status: GroupStatus
    ownerId: string
    verified?: boolean
    updatedAt?: Date
    verifiedOn?: Date
    createdAt?: Date
}

export type GroupOverview = {
    totalCases: number
    totalClients: number
    storageUsed: number
    totalEnrollments: number
}

export interface AuditLogDto {
    creatorId: string
    entityId: string
    entity: string
    action: 'delete' | 'create' | 'update'
    previousData?: unknown
    updatedData?: unknown
}
export interface AuditLog extends AuditLogDto {
    id: string
    creator: Creator
    createdAt?: Date
    updatedAt?: Date
}

export interface ExpandedState {
    previous: boolean
    updated: boolean
}

interface Creator {
    id: string
    name: string
    email: string
}

export interface Action {
    name: string
}
export type ActionType = 'create' | 'update' | 'delete'

export interface FilestoreItemDto {
    entityName?: string
}

export interface FilestoreItem extends FilestoreItemDto {
    id: string
    filename: string
    url: string
    type: string
    extension: string
    size: number
    groupId: string
    uploadedBy: string
    createdAt: Date
    updatedAt: Date
}

export interface ApiResponseMeta {
    [Key: string]: unknown
}
export interface ApiResponsePagination {
    total?: number
    page?: number
    size?: number
}

export interface ApiResponse<T> {
    data: T
    meta?: ApiResponseMeta
    pagination?: ApiResponsePagination
    error?: unknown
    message?: string
    success?: boolean
}

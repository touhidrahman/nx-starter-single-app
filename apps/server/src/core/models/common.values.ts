export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

export const APP_OPENAPI_TAGS = {
    ACCOUNT: 'Account',
    ADMIN: 'Admin',
    AUTH: 'Auth',
    CATEGORY: 'Category',
    TRANSACTION: 'Transaction',
    USER: 'User',
} as const

export const REQ_METHOD = {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete',
    PATCH: 'patch',
} as const

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

export const APP_OPENAPI_TAGS = {
    Account: 'Account',
    AuditLog: 'AuditLog',
    AccountType: 'AccountType',
    Admin: 'Admin',
    Auth: 'Auth',
    Category: 'Category',
    Currency: 'Currency',
    Feedback: 'Feedback',
    Group: 'Group',
    Invite: 'Invite',
    Membership: 'Membership',
    Subscription: 'Subscription',
    Referral: 'Referral',
    Role: 'Role',
    Subcategory: 'Subcategory',
    Transaction: 'Transaction',
    User: 'User',
} as const

export const REQ_METHOD = {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete',
    PATCH: 'patch',
} as const

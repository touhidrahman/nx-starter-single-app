export const APP_DEFAULT_ROLES = ['Owner', 'Member', 'Guest']

export const [GroupOwner, GroupMember, GroupGuest] = APP_DEFAULT_ROLES

type PermissionSeedItem = {
    id: string
    section: string
    description: string
    forRoles: string[]
}

export const DEFAULT_PERMISSIONS: PermissionSeedItem[] = [
    {
        id: 'Account:Read',
        section: 'Account',
        description: 'Read account details',
        forRoles: [GroupOwner, GroupMember],
    },
    {
        id: 'Account:Write',
        section: 'Account',
        description: 'Write account details',
        forRoles: [GroupOwner, GroupMember],
    },
    {
        id: 'Account:Delete',
        section: 'Account',
        description: 'Delete account details',
        forRoles: [GroupOwner, GroupMember],
    },

    {
        id: 'Category:Read',
        section: 'Category',
        description: 'Read category details',
        forRoles: [GroupOwner, GroupMember],
    },
    {
        id: 'Category:Write',
        section: 'Category',
        description: 'Write category details',
        forRoles: [GroupOwner, GroupMember],
    },
    {
        id: 'Category:Delete',
        section: 'Category',
        description: 'Delete category details',
        forRoles: [GroupOwner, GroupMember],
    },

    {
        id: 'Subcategory:Read',
        section: 'Subcategory',
        description: 'Read Subcategory details',
        forRoles: [GroupOwner, GroupMember],
    },
    {
        id: 'Subcategory:Write',
        section: 'Subcategory',
        description: 'Write Subcategory details',
        forRoles: [GroupOwner, GroupMember],
    },
    {
        id: 'Subcategory:Delete',
        section: 'Subcategory',
        description: 'Delete Subcategory details',
        forRoles: [GroupOwner, GroupMember],
    },

    {
        id: 'Transaction:Write',
        section: 'Transaction',
        description: 'Create or update a new transaction entry',
        forRoles: [GroupOwner],
    },
    {
        id: 'Transaction:Delete',
        section: 'Transaction',
        description: 'Delete a transaction entry',
        forRoles: [GroupOwner],
    },
    {
        id: 'Transaction:Read',
        section: 'Transaction',
        description: 'Read transaction details',
        forRoles: [GroupOwner, GroupMember],
    },

    {
        id: 'TransactionSchedule:Write',
        section: 'Transaction',
        description: 'Create or update a new transaction entry',
        forRoles: [GroupOwner],
    },
    {
        id: 'TransactionSchedule:Delete',
        section: 'Transaction',
        description: 'Delete a transaction entry',
        forRoles: [GroupOwner],
    },
    {
        id: 'TransactionSchedule:Read',
        section: 'Transaction',
        description: 'Read transaction details',
        forRoles: [GroupOwner, GroupMember],
    },

    {
        id: 'Invite:Write',
        section: 'User',
        description: 'Invite user to Organization, revoke invite',
        forRoles: [GroupOwner],
    },

    {
        id: 'Member:Write',
        section: 'Member',
        description: 'Create or update a new member',
        forRoles: [GroupOwner],
    },
    {
        id: 'Member:Delete',
        section: 'Member',
        description: 'Delete an existing member',
        forRoles: [GroupOwner],
    },
    {
        id: 'Member:Read',
        section: 'Member',
        description: 'Read member details',
        forRoles: [GroupOwner, GroupMember],
    },

    {
        id: 'Subscription:Write',
        section: 'Subscription',
        description: 'Create or update a new subscription',
        forRoles: [GroupOwner],
    },
    {
        id: 'Subscription:Delete',
        section: 'Subscription',
        description: 'Delete an existing subscription',
        forRoles: [GroupOwner],
    },
    {
        id: 'Subscription:Read',
        section: 'Subscription',
        description: 'Read subscription details',
        forRoles: [GroupOwner, GroupMember],
    },

    {
        id: 'User:Read',
        section: 'User',
        description: 'user can read their own information',
        forRoles: [GroupOwner],
    },

    {
        id: 'Role:Read',
        section: 'Role',
        description: 'Can read the role & permissions',
        forRoles: [GroupOwner, GroupMember],
    },
    {
        id: 'Role:Assign',
        section: 'Role',
        description: 'Can assign the role to user',
        forRoles: [GroupOwner],
    },
    {
        id: 'Role:Write',
        section: 'Role',
        description: 'Can create the role',
        forRoles: [GroupOwner],
    },
    {
        id: 'Role:Delete',
        section: 'Role',
        description: 'Can delete the role',
        forRoles: [GroupOwner],
    },
]

export const CLAIMS_LIST: PermissionSeedItem[] = [...DEFAULT_PERMISSIONS]

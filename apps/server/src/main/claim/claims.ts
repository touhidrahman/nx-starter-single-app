const SYSTEM_ROLE_NAMES_CLIENT = ['Owner', 'Member']

export const [GroupOwner, GroupMember] = SYSTEM_ROLE_NAMES_CLIENT

type ClaimSeedItem = {
    id: string
    section: string
    description: string
    forRoles: string[]
}

export const CLIENT_CLAIMS_LIST: ClaimSeedItem[] = [
    {
        id: 'account:read',
        section: 'Account',
        description: 'Read account details',
        forRoles: [GroupOwner, GroupMember],
    },
    {
        id: 'account:write',
        section: 'Account',
        description: 'Write account details',
        forRoles: [GroupOwner, GroupMember],
    },
    {
        id: 'account:delete',
        section: 'Account',
        description: 'Delete account details',
        forRoles: [GroupOwner, GroupMember],
    },

    {
        id: 'transaction:write',
        section: 'Transaction',
        description: 'Create or update a new transaction entry',
        forRoles: [GroupOwner],
    },
    {
        id: 'transaction:delete',
        section: 'Transaction',
        description: 'Delete a transaction entry',
        forRoles: [GroupOwner],
    },
    {
        id: 'transaction:read',
        section: 'Transaction',
        description: 'Read transaction details',
        forRoles: [GroupOwner, GroupMember],
    },

    {
        id: 'invite:write',
        section: 'User',
        description: 'Invite user to Organization, revoke invite',
        forRoles: [GroupOwner],
    },

    {
        id: 'member:write',
        section: 'Member',
        description: 'Create or update a new member',
        forRoles: [GroupOwner],
    },
    {
        id: 'member:delete',
        section: 'Member',
        description: 'Delete an existing member',
        forRoles: [GroupOwner],
    },
    {
        id: 'member:read',
        section: 'Member',
        description: 'Read member details',
        forRoles: [GroupOwner, GroupMember],
    },

    {
        id: 'subscription:write',
        section: 'Subscription',
        description: 'Create or update a new subscription',
        forRoles: [GroupOwner],
    },
    {
        id: 'subscription:delete',
        section: 'Subscription',
        description: 'Delete an existing subscription',
        forRoles: [GroupOwner],
    },
    {
        id: 'subscription:read',
        section: 'Subscription',
        description: 'Read subscription details',
        forRoles: [GroupOwner, GroupMember],
    },

    {
        id: 'user:read',
        section: 'User',
        description: 'user can read their own information',
        forRoles: [GroupOwner],
    },

    {
        id: 'role:read',
        section: 'Role',
        description: 'Can read the role & permissions',
        forRoles: [GroupOwner, GroupMember],
    },
    {
        id: 'role:assign',
        section: 'Role',
        description: 'Can assign the role to user',
        forRoles: [GroupOwner],
    },
    {
        id: 'role:write',
        section: 'Role',
        description: 'Can create the role',
        forRoles: [GroupOwner],
    },
    {
        id: 'role:delete',
        section: 'Role',
        description: 'Can delete the role',
        forRoles: [GroupOwner],
    },
]

export const CLAIMS_LIST: ClaimSeedItem[] = [...CLIENT_CLAIMS_LIST]

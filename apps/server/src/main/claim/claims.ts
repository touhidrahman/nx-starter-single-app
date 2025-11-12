const SYSTEM_ROLE_NAMES_VENDOR = ['Owner', 'Lawyer', 'Clerk']
const SYSTEM_ROLE_NAMES_CLIENT = ['Manager', 'Member']

export const [VendorOwner, VendorLawyer, VendorClerk] = SYSTEM_ROLE_NAMES_VENDOR
export const [ClientManager, ClientMember] = SYSTEM_ROLE_NAMES_CLIENT

type ClaimSeedItem = {
    id: string
    section: string
    groupType: 'vendor' | 'client'
    description: string
    forRoles: string[]
}

export const CLIENT_CLAIMS_LIST: ClaimSeedItem[] = [
    {
        id: 'case:read',
        groupType: 'client',
        section: 'Case',
        description: 'Read case details',
        forRoles: [ClientManager, ClientMember],
    },

    {
        id: 'follow:write',
        groupType: 'client',
        section: 'Following Case',
        description: 'Create or update a new follow entry',
        forRoles: [ClientManager],
    },
    {
        id: 'follow:delete',
        groupType: 'client',
        section: 'Following Case',
        description: 'Delete a follow entry',
        forRoles: [ClientManager],
    },
    {
        id: 'follow:read',
        groupType: 'client',
        section: 'Following Case',
        description: 'Read follow details',
        forRoles: [ClientManager, ClientMember],
    },

    {
        id: 'event:read',
        groupType: 'client',
        section: 'Event',
        description: 'Read event details',
        forRoles: [ClientManager, ClientMember],
    },
    {
        id: 'invite:write',
        groupType: 'client',
        section: 'User',
        description: 'Invite user to Organization, revoke invite',
        forRoles: [ClientManager],
    },
    {
        id: 'member:write',
        groupType: 'client',
        section: 'Member',
        description: 'Create or update a new member',
        forRoles: [ClientManager],
    },
    {
        id: 'member:delete',
        groupType: 'client',
        section: 'Member',
        description: 'Delete an existing member',
        forRoles: [ClientManager],
    },
    {
        id: 'member:read',
        groupType: 'client',
        section: 'Member',
        description: 'Read member details',
        forRoles: [ClientManager, ClientMember],
    },

    {
        id: 'event:read',
        groupType: 'client',
        section: 'Event',
        description: 'Read event details',
        forRoles: [ClientManager, ClientMember],
    },

    {
        id: 'subscription:write',
        groupType: 'client',
        section: 'Subscription',
        description: 'Create or update a new subscription',
        forRoles: [ClientManager],
    },
    {
        id: 'subscription:delete',
        groupType: 'client',
        section: 'Subscription',
        description: 'Delete an existing subscription',
        forRoles: [ClientManager],
    },
    {
        id: 'subscription:read',
        groupType: 'client',
        section: 'Subscription',
        description: 'Read subscription details',
        forRoles: [ClientManager, ClientMember],
    },

    {
        id: 'user:read',
        groupType: 'client',
        section: 'User',
        description: 'user can read their own information',
        forRoles: [ClientManager],
    },
    {
        id: 'role:read',
        groupType: 'client',
        section: 'Role',
        description: 'Can read the role & permissions',
        forRoles: [ClientManager, ClientMember],
    },
    {
        id: 'role:assign',
        groupType: 'client',
        section: 'Role',
        description: 'Can assign the role to user',
        forRoles: [ClientManager],
    },
    {
        id: 'role:write',
        groupType: 'client',
        section: 'Role',
        description: 'Can create the role',
        forRoles: [ClientManager],
    },
    {
        id: 'role:delete',
        groupType: 'client',
        section: 'Role',
        description: 'Can delete the role',
        forRoles: [ClientManager],
    },
]

export const VENDOR_CLAIMS_LIST: ClaimSeedItem[] = [
    {
        id: 'case:write',
        groupType: 'vendor',
        section: 'Case',
        description: 'Create or update a new case',
        forRoles: [VendorOwner, VendorLawyer, VendorClerk],
    },
    {
        id: 'case:delete',
        groupType: 'vendor',
        section: 'Case',
        description: 'Delete an existing case',
        forRoles: [VendorOwner, VendorLawyer],
    },
    {
        id: 'case:read',
        groupType: 'vendor',
        section: 'Case',
        description: 'Read case details',
        forRoles: [VendorOwner, VendorLawyer, VendorClerk],
    },
    {
        id: 'case:assign',
        groupType: 'vendor',
        section: 'Case',
        description: 'Add member to a case',
        forRoles: [VendorOwner, VendorLawyer],
    },
    {
        id: 'client:write',
        groupType: 'vendor',
        section: 'Client',
        description: 'Create or update a new client',
        forRoles: [VendorOwner, VendorLawyer, VendorClerk],
    },
    {
        id: 'client:delete',
        groupType: 'vendor',
        section: 'Client',
        description: 'Delete an existing client',
        forRoles: [VendorOwner, VendorLawyer],
    },
    {
        id: 'client:read',
        groupType: 'vendor',
        section: 'Client',
        description: 'Read client details',
        forRoles: [VendorOwner, VendorLawyer, VendorClerk],
    },

    {
        id: 'court:write',
        groupType: 'vendor',
        section: 'Court',
        description: 'Create or update a new court',
        forRoles: [VendorOwner, VendorLawyer],
    },
    {
        id: 'court:delete',
        groupType: 'vendor',
        section: 'Court',
        description: 'Delete an existing court',
        forRoles: [VendorOwner],
    },
    {
        id: 'court:read',
        groupType: 'vendor',
        section: 'Court',
        description: 'Read court details',
        forRoles: [VendorOwner, VendorLawyer, VendorClerk],
    },

    {
        id: 'document:write',
        groupType: 'vendor',
        section: 'Document',
        description: 'Create or update a new document',
        forRoles: [VendorOwner, VendorLawyer, VendorClerk],
    },
    {
        id: 'document:delete',
        groupType: 'vendor',
        section: 'Document',
        description: 'Delete an existing document',
        forRoles: [VendorOwner, VendorLawyer],
    },
    {
        id: 'document:read',
        groupType: 'vendor',
        section: 'Document',
        description: 'Read document details',
        forRoles: [VendorOwner, VendorLawyer, VendorClerk],
    },

    {
        id: 'event:write',
        groupType: 'vendor',
        section: 'Event',
        description: 'Create or update a new event',
        forRoles: [VendorOwner, VendorLawyer, VendorClerk],
    },
    {
        id: 'event:delete',
        groupType: 'vendor',
        section: 'Event',
        description: 'Delete an existing event',
        forRoles: [VendorOwner, VendorLawyer],
    },
    {
        id: 'event:read',
        groupType: 'vendor',
        section: 'Event',
        description: 'Read event details',
        forRoles: [VendorOwner, VendorLawyer, VendorClerk],
    },

    {
        id: 'follow:write',
        groupType: 'vendor',
        section: 'Following Case',
        description: 'Create or update a new follow entry',
        forRoles: [VendorOwner, VendorLawyer],
    },
    {
        id: 'follow:delete',
        groupType: 'vendor',
        section: 'Following Case',
        description: 'Delete a follow entry',
        forRoles: [VendorOwner, VendorLawyer],
    },
    {
        id: 'follow:read',
        groupType: 'vendor',
        section: 'Following Case',
        description: 'Read follow details',
        forRoles: [VendorOwner, VendorLawyer, VendorClerk],
    },

    {
        id: 'member:write',
        groupType: 'vendor',
        section: 'Member',
        description: 'Create or update a new member',
        forRoles: [VendorOwner, VendorLawyer],
    },
    {
        id: 'member:delete',
        groupType: 'vendor',
        section: 'Member',
        description: 'Delete an existing member',
        forRoles: [VendorOwner, VendorLawyer],
    },
    {
        id: 'member:read',
        groupType: 'vendor',
        section: 'Member',
        description: 'Read member details',
        forRoles: [VendorOwner, VendorLawyer, VendorClerk],
    },

    {
        id: 'note:write',
        groupType: 'vendor',
        section: 'Note',
        description: 'Create or update a new note',
        forRoles: [VendorOwner, VendorLawyer, VendorClerk],
    },
    {
        id: 'note:delete',
        groupType: 'vendor',
        section: 'Note',
        description: 'Delete an existing note',
        forRoles: [VendorOwner, VendorLawyer],
    },
    {
        id: 'note:read',
        groupType: 'vendor',
        section: 'Note',
        description: 'Read note details',
        forRoles: [VendorOwner, VendorLawyer],
    },

    {
        id: 'subscription:write',
        groupType: 'vendor',
        section: 'Subscription',
        description: 'Create or update a new subscription',
        forRoles: [VendorOwner],
    },
    {
        id: 'subscription:delete',
        groupType: 'vendor',
        section: 'Subscription',
        description: 'Delete an existing subscription',
        forRoles: [VendorOwner],
    },
    {
        id: 'subscription:read',
        groupType: 'vendor',
        section: 'Subscription',
        description: 'Read subscription details',
        forRoles: [VendorOwner, VendorLawyer, VendorClerk],
    },

    {
        id: 'invite:write',
        groupType: 'vendor',
        section: 'User',
        description: 'Invite user to Organization, revoke invite',
        forRoles: [VendorOwner],
    },
    {
        id: 'user:read',
        groupType: 'vendor',
        section: 'User',
        description: 'user can read their own information',
        forRoles: [VendorOwner],
    },

    {
        id: 'role:read',
        groupType: 'vendor',
        section: 'Role',
        description: 'Can read the role & permissions',
        forRoles: [VendorOwner],
    },
    {
        id: 'role:assign',
        groupType: 'vendor',
        section: 'Role',
        description: 'Can assign the role to user',
        forRoles: [VendorOwner],
    },
    {
        id: 'role:write',
        groupType: 'vendor',
        section: 'Role',
        description: 'Can create the role',
        forRoles: [VendorOwner],
    },
    {
        id: 'role:delete',
        groupType: 'vendor',
        section: 'Role',
        description: 'Can delete the role',
        forRoles: [VendorOwner],
    },
    {
        id: 'act:write',
        groupType: 'vendor',
        section: 'Act',
        description: 'Can created the act',
        forRoles: [VendorOwner, VendorLawyer],
    },
    {
        id: 'act:read',
        groupType: 'vendor',
        section: 'Act',
        description: 'Can read the act',
        forRoles: [VendorOwner, VendorLawyer, VendorClerk],
    },
    {
        id: 'act:delete',
        groupType: 'vendor',
        section: 'Act',
        description: 'Can delete the act',
        forRoles: [VendorOwner, VendorLawyer],
    },
]

export const CLAIMS_LIST: ClaimSeedItem[] = [
    ...VENDOR_CLAIMS_LIST,
    ...CLIENT_CLAIMS_LIST,
]

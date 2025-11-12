export interface InvitationDto {
    email: string
    groupId: string
    invitedBy: string
    roleId: string
    roleName: string
    status: string
}

export interface Invitation extends InvitationDto {
    id: string
    invitedOn: Date
    acceptedOn: Date
}

export type InvitationTokenPayload = {
    userEmail: string
    organizationId: string
    organizationName: string
    roleId: string
    invitationId: string
}

import { Injectable } from '@angular/core'
import { MemberRegisterRequest } from '@repo/group'
import { SimpleStore } from '@repo/store'
import { User } from './user.model'
import { UserApiService } from './user-api.service'

export interface UserManagementState {
    users: User[]
    joinRequests: MemberRegisterRequest[]
}

export const initialUserManagementState: UserManagementState = {
    users: [],
    joinRequests: [],
}

@Injectable({
    providedIn: 'root',
})
export class UserManagementStateService extends SimpleStore<UserManagementState> {
    constructor(private userApiService: UserApiService) {
        super(initialUserManagementState)
    }

    loadJoinRequests(organizationId: string) {
        this.userApiService.getUnapprovedUsers(organizationId).subscribe({
            next: ({ data: joinRequests }) => {
                this.setState({ joinRequests })
            },
        })
    }

    loadUsers(organizationId: string) {
        this.userApiService.find({ organizationId }).subscribe({
            next: ({ data: users }) => {
                this.setState({ users })
            },
        })
    }
}

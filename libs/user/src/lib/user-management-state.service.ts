import { Injectable } from '@angular/core'
import { SimpleStore } from '@repo/store'
import { User } from './user.model'
import { UserApiService } from './user-api.service'

export interface UserManagementState {
    users: User[]
}

export const initialUserManagementState: UserManagementState = {
    users: [],
}

@Injectable({
    providedIn: 'root',
})
export class UserManagementStateService extends SimpleStore<UserManagementState> {
    constructor(private userApiService: UserApiService) {
        super(initialUserManagementState)
    }

    loadUsers(organizationId: string) {
        this.userApiService.find({ organizationId }).subscribe({
            next: ({ data: users }) => {
                this.setState({ users })
            },
        })
    }
}

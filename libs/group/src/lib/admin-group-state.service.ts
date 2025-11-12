import { Injectable, inject } from '@angular/core'
import { MessageLogApiService } from '@repo/case'
import { Role, RoleApiService } from '@repo/role-permission'
import { User, UserApiService } from '@repo/user'
import { SimpleStore } from '@repo/store'
import { catchError, finalize, of, switchMap, tap, throwError } from 'rxjs'

export type AdminGroupManagementState = {
    roles: Role[]
    users: User[]
    groupMessages: []
    loading: boolean
    error: boolean
}

const initialAdminGroupManagementState: AdminGroupManagementState = {
    roles: [],
    users: [],
    groupMessages: [],
    loading: false,
    error: false,
}

@Injectable({
    providedIn: 'root',
})
export class AdminGroupManagementStateService extends SimpleStore<AdminGroupManagementState> {
    private initialized = false
    private userApiService = inject(UserApiService)
    private roleApiService = inject(RoleApiService)
    private messageLogApiService = inject(MessageLogApiService)

    private initializedGroupId: string | null = null

    constructor() {
        super(initialAdminGroupManagementState)
    }

    init(groupId: string | null) {
        if (this.initialized || !groupId) {
            this.setState({ loading: false, error: true })
            return
        }
        if (this.initializedGroupId === groupId) {
            return
        }

        this.continueLoadingUsers(groupId)
        this.continueLoadingRoles(groupId)
        this.continueLoadingMessages(groupId)

        this.initializedGroupId = groupId
    }

    pushRole(role: Role) {
        this.setState({ roles: [...this.getState().roles, role] })
    }

    deleteRole(id: string) {
        this.setState({ loading: true })
        return this.roleApiService.delete(id).pipe(
            tap(() => {
                const updatedRoles = this.getState().roles.filter(
                    (role) => role.id !== id,
                )

                this.setState({
                    roles: updatedRoles,
                    loading: false,
                })
            }),
            catchError(() => {
                this.setState({ error: true })
                return throwError(() => new Error('Failed to delete role.'))
            }),
            finalize(() => this.setState({ loading: false })),
        )
    }

    private continueLoadingUsers(groupId: string) {
        this.getMembers(groupId)
            .pipe(
                tap(() => this.setState({ loading: true, error: false })),
                catchError(() => {
                    this.setState({ loading: false, error: true })
                    return throwError(() => new Error('Failed to load users.'))
                }),
                finalize(() => this.setState({ loading: false })),
            )
            .subscribe({
                next: (users) => {
                    this.setState({
                        users,
                        loading: false,
                        error: false,
                    })
                },
                error: () => {
                    this.setState({
                        users: [],
                        loading: false,
                        error: true,
                    })
                },
            })
    }

    private continueLoadingRoles(groupId: string) {
        this.getRoles(groupId)
            .pipe(
                tap(() => this.setState({ loading: true, error: false })),
                catchError(() => {
                    this.setState({ loading: false, error: true })
                    return throwError(() => new Error('Failed to load roles.'))
                }),
                finalize(() => this.setState({ loading: false })),
            )
            .subscribe({
                next: (roles) => {
                    this.setState({
                        roles,
                        loading: false,
                        error: false,
                    })
                },
                error: () => {
                    this.setState({
                        roles: [],
                        loading: false,
                        error: true,
                    })
                },
            })
    }

    private continueLoadingMessages(groupId: string) {
        this.getGroupMessages(groupId)
            .pipe(
                tap(() => this.setState({ loading: true, error: false })),
                catchError(() => {
                    this.setState({ loading: false, error: true })
                    return throwError(() => new Error('Failed to load roles.'))
                }),
                finalize(() => this.setState({ loading: false })),
            )
            .subscribe({
                next: (groupMessages) => {
                    this.setState({
                        groupMessages,
                        loading: false,
                        error: false,
                    })
                },
                error: () => {
                    this.setState({
                        groupMessages: [],
                        loading: false,
                        error: true,
                    })
                },
            })
    }

    private getMembers(groupId: string) {
        return this.userApiService.getUsersByGroupId(groupId).pipe(
            switchMap((response) => {
                if (response.success) {
                    return of(response.data)
                }
                return of([])
            }),
        )
    }

    private getRoles(groupId: string) {
        return this.roleApiService.find({ groupId }).pipe(
            switchMap((response) => {
                if (response.success) {
                    return of(response.data)
                }
                return of([])
            }),
        )
    }

    private getGroupMessages(groupId: string) {
        return this.messageLogApiService.getMessageLogsByGroupId(groupId).pipe(
            switchMap((response) => {
                if (response.success) {
                    return of(response.data)
                }
                return of([])
            }),
        )
    }
}

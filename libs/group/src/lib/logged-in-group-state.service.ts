import { Injectable, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { AuthStateService } from '@repo/auth'
import { Role, RoleApiService } from '@repo/role-permission'
import { SimpleStore } from '@repo/store'
import { User, UserApiService } from '@repo/user'
import { catchError, combineLatest, of, switchMap, tap, throwError } from 'rxjs'

export type LoggedInGroupState = {
    groupOwner: User | null
    roles: Role[]
    users: User[]
    loading: boolean
}

const initialState: LoggedInGroupState = {
    groupOwner: null,
    roles: [],
    users: [],
    loading: false,
}

@Injectable({ providedIn: 'root' })
export class LoggedInGroupStateService extends SimpleStore<LoggedInGroupState> {
    private initialized = false
    private readonly userApi = inject(UserApiService)
    private readonly roleApi = inject(RoleApiService)
    private readonly authState = inject(AuthStateService)
    private readonly route = inject(ActivatedRoute)

    constructor() {
        super(initialState)
        this.init()
    }

    init() {
        if (this.initialized) return

        this.loadUsers()
        this.loadRoles()
        this.observeGroupOwner()

        this.initialized = true
    }

    private getCurrentGroupId(): string | null {
        const routeGroupId =
            this.route.snapshot.paramMap.get('groupId') || this.route.snapshot.paramMap.get('id')
        const authGroupId = this.authState.getState().group?.id
        return routeGroupId || authGroupId || null
    }

    private loadUsers() {
        this.authState
            .select('group')
            .pipe(
                switchMap(() => {
                    const groupId = this.getCurrentGroupId()
                    return this.getMembers(groupId)
                }),
            )
            .subscribe((users) => this.setState({ users }))
    }

    private loadRoles() {
        this.authState
            .select('group')
            .pipe(
                switchMap(() => {
                    const groupId = this.getCurrentGroupId()
                    return this.getRoles(groupId)
                }),
            )
            .subscribe((roles) => this.setState({ roles }))
    }

    private observeGroupOwner() {
        combineLatest([this.select('users'), this.authState.select('group')])
            .pipe(
                switchMap(([users, group]) => {
                    const owner = users.find((u) => u.id === group?.ownerId) || null
                    return of(owner)
                }),
            )
            .subscribe((groupOwner) => this.setState({ groupOwner }))
    }

    /** Fetch group users */
    private getMembers(groupId: string | null) {
        if (!groupId) return of([])
        return this.userApi
            .getUsersByGroupId(groupId)
            .pipe(switchMap((res) => (res.success ? of(res.data) : of([]))))
    }

    /** Fetch roles */
    private getRoles(groupId: string | null) {
        if (!groupId) return of([])
        return this.roleApi
            .find({ groupId })
            .pipe(switchMap((res) => (res.success ? of(res.data) : of([]))))
    }

    deleteRole(id: string) {
        this.setState({ loading: true })
        return this.roleApi.delete(id).pipe(
            tap(() => {
                const roles = this.getState().roles.filter((r) => r.id !== id)
                this.setState({ roles, loading: false })
            }),
            catchError(() => throwError(() => new Error('Failed to delete role'))),
        )
    }

    updateRole(roleId: string, claims: string[]) {
        this.setState({ loading: true })
        return this.roleApi.update(roleId, { claims: claims.sort() }).pipe(
            tap(({ data }) => {
                const roles = this.getState().roles.map((r) => (r.id === data.id ? data : r))
                this.setState({ roles, loading: false })
            }),
            catchError((error) =>
                throwError(() => new Error(`Failed to update role: ${error.message}`)),
            ),
        )
    }

    updateUserRole(userId: string, roleId: string) {
        this.setState({ loading: true })
        const roleName = this.getState().roles.find((r) => r.id === roleId)?.name ?? ''

        return this.userApi.changeRole(userId, roleId).pipe(
            tap(() => {
                const users = this.getState().users.map((u) =>
                    u.id === userId ? { ...u, roleId, roleName } : u,
                )
                this.setState({ users, loading: false })
            }),
            catchError(() => throwError(() => new Error('Failed to update user role'))),
        )
    }

    pushRole(role: Role) {
        this.setState({ roles: [...this.getState().roles, role] })
    }

    removeUserFromGroup(userId: string) {
        const users = this.getState().users.filter((u) => u.id !== userId)
        this.setState({ users })
    }
}

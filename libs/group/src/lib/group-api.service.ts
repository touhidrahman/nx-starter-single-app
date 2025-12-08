import { HttpClient } from '@angular/common/http'
import { Inject, Injectable, inject } from '@angular/core'
import { Params } from '@angular/router'
import { Group, GroupInput, GroupOverview } from '@repo/common-auth'
import { ApiResponse } from '@repo/common-models'
import { ApiService } from '@repo/common-services'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'
import { shake } from 'radash'
import { Observable } from 'rxjs'

export type GroupMemberShipResponse = {
    groups: (Group & { membership: 'owner' | 'member' })[]
    hasVendorGroup: boolean
    hasClientGroup: boolean
}

@Injectable({ providedIn: 'root' })
export class GroupApiService extends ApiService<Group, GroupInput> {
    constructor(
        @Inject(APP_ENVIRONMENT)
        private env: AppEnvironmentConfig,
    ) {
        super(inject(HttpClient), `${env.apiUrl}/v1/groups`)
    }

    override find(params: {
        search?: string
        page: number
        size: number
        orderBy?: 'asc' | 'desc'
        type?: string
        status?: string
    }): Observable<ApiResponse<Group[]>> {
        return super.find(shake(params))
    }

    getMyGroups(): Observable<ApiResponse<GroupMemberShipResponse>> {
        return this.http.get<ApiResponse<GroupMemberShipResponse>>(`${this.apiUrl}/my-groups`)
    }

    getById(id: string): Observable<ApiResponse<Group>> {
        return this.http.get<ApiResponse<Group>>(`${this.apiUrl}/${id}`)
    }

    addUserToOrganization(groupId: string, userId: string) {
        return this.http.post(`${this.apiUrl}/${groupId}/add-user`, { userId })
    }

    updateUserRoleInOrganization(id: string, userId: string, roleId: string) {
        return this.http.post(`${this.apiUrl}/${id}/update-user-role`, {
            userId,
            roleId,
        })
    }

    removeUserFromOrganization(groupId: string, userId: string): Observable<ApiResponse<unknown>> {
        return this.http.delete<ApiResponse<unknown>>(
            `${this.apiUrl}/${groupId}/remove-user/${userId}`,
        )
    }

    leaveGroup(id: string) {
        return this.http.delete(`${this.apiUrl}/${id}/leave`)
    }

    findAll(url: string, params: Params = {}): Observable<ApiResponse<Group[]>> {
        return this.http.get<ApiResponse<Group[]>>(url, { params })
    }

    updateGroupStatus(id: string, status: string): Observable<ApiResponse<Group>> {
        return this.http.put<ApiResponse<Group>>(`${this.apiUrl}/update-status/${id}`, { status })
    }

    groupDeleteByIdByTyping(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/delete/${id}`)
    }

    getGroupOverview(): Observable<ApiResponse<GroupOverview>> {
        return this.http.get<ApiResponse<GroupOverview>>(`${this.env.apiUrl}/v1/group/overview`)
    }
}

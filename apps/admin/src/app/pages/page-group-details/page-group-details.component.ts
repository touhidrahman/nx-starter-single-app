import { CommonModule } from '@angular/common'
import { Component, inject, input, OnInit, signal } from '@angular/core'
import { RouterModule } from '@angular/router'
import { Group } from '@repo/common-auth'
import { GroupFormService, GroupStateService } from '@repo/group'
import { PrimeModules } from '@repo/prime-modules'
import { GroupTab } from './group-tab.model'

@Component({
    selector: 'app-page-group-details',
    standalone: true,
    imports: [CommonModule, RouterModule, PrimeModules],
    templateUrl: './page-group-details.component.html',
    styleUrl: './page-group-details.component.scss',
    providers: [GroupFormService, GroupStateService],
})
export class PageGroupDetailsComponent implements OnInit {
    protected groupStateService = inject(GroupStateService)
    protected groupFormService = inject(GroupFormService)

    groupId = input.required<string>()

    protected selectedGroup = signal<Group | null>(null)
    protected loading = signal<boolean>(false)
    protected readonly GROUP_TABS: GroupTab[] = [
        {
            route: 'details',
            label: 'Details',
            icon: 'pi pi-info-circle',
        },
        {
            route: 'permission',
            label: 'Permissions',
            icon: 'pi pi-sitemap',
        },
        {
            route: 'members',
            label: 'Members',
            icon: 'pi pi-users',
        },
        {
            route: 'cases',
            label: 'Group Cases',
            icon: 'pi pi-history',
        },
        {
            route: 'messages',
            label: 'Sent Messages',
            icon: 'pi pi-envelope',
        },
    ]

    ngOnInit(): void {
        this.groupStateService.init()
        this.groupStateService.setState({ groupId: this.groupId() })
        this.getGroupData()
    }

    getGroupData() {
        this.groupStateService.select('group').subscribe({
            next: (data) => {
                if (data) {
                    this.selectedGroup.set(data)
                    this.groupFormService.form.patchValue(data)
                }
            },
        })
    }
}

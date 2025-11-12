import { Component, inject, OnInit, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { AuthApiService, GroupType } from '@repo/common-auth'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { AuthStateService } from '../auth-state.service'
import { GroupFormService } from '../group-form.service'

@Component({
    selector: 'myorg-page-create-profile-form',
    imports: [ReactiveFormsModule, PrimeModules],
    templateUrl: './page-create-profile-form.component.html',
    styleUrl: './page-create-profile-form.component.css',
    providers: [GroupFormService],
})
export class PageCreateProfileFormComponent implements OnInit {
    private authApiService = inject(AuthApiService)
    private router = inject(Router)
    private alertService = inject(AlertService)
    authStateService = inject(AuthStateService)
    groupFormService = inject(GroupFormService)

    error = ''
    isLoading = false
    selectedGroupType = signal<GroupType>(GroupType.client)

    ngOnInit(): void {
        this.setTypeToForm()
        this.setSelectedGroupType()
    }

    submit() {
        this.isLoading = true
        if (this.groupFormService.form.invalid) {
            this.isLoading = false
            return
        }

        const formValue = this.groupFormService.getValue()
        const { ...payload } = formValue
        if (!this.selectedGroupType()) {
            this.isLoading = false
            return
        }

        this.authApiService
            .createGroup(payload, this.selectedGroupType() as GroupType)
            .subscribe({
                next: (_res) => {
                    this.isLoading = false
                    this.router.navigate(['/profile-created'])
                    this.authStateService.logout('/profile-created')
                },
                error: (error) => {
                    this.isLoading = false
                    this.error = error.error.message
                    this.alertService.error(
                        error.error.message || 'Error occurred',
                    )
                },
            })
    }

    private setSelectedGroupType() {
        const groupType =
            this.authStateService.getGroup()?.type === GroupType.client
                ? GroupType.vendor
                : GroupType.client
        this.selectedGroupType.set(groupType)
    }

    private setTypeToForm() {
        this.groupFormService.form.patchValue({
            type: this.selectedGroupType(),
        })
    }
}

import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { PrimeModules } from '@repo/prime-modules'
import { CaseGroupMessage } from '@repo/case'
import { AdminGroupManagementStateService } from '../../admin-group-state.service'

@Component({
    selector: 'app-group-message-list',
    imports: [CommonModule, ...PrimeModules],
    templateUrl: './group-message-list.component.html',
    styleUrl: './group-message-list.component.css',
})
export class GroupMessageListComponent implements OnInit {
    adminGroupManagementStateService = inject(AdminGroupManagementStateService)
    private route = inject(ActivatedRoute)
    groupId = signal<string | null>('')
    messages = signal<CaseGroupMessage[]>([])

    ngOnInit(): void {
        this.groupId.set(this.route.snapshot.paramMap.get('groupId') as string)
        this.route.parent?.paramMap.subscribe((params) => {
            this.groupId.set(params.get('groupId'))
        })

        this.adminGroupManagementStateService.init(this.groupId())

        this.adminGroupManagementStateService
            .select('groupMessages')
            .subscribe((messages) => {
                this.messages.set(messages)
            })
    }
}

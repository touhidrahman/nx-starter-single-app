import { AsyncPipe } from '@angular/common'
import { Component, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { CaseListStateService } from '@repo/case'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-page-cases',
    imports: [RouterModule, PrimeModules, AsyncPipe],
    templateUrl: './page-cases.component.html',
    styleUrl: './page-cases.component.scss',
})
export class PageCasesComponent {
    caseListStateService = inject(CaseListStateService)

    // openDialog(data: Case | null) {
    //     const header = data ? 'Edit Case' : 'Create Case'
    //     const ref = this.dialogService.open(CaseCreateDialogueComponent, {
    //         header,
    //         width: '70vw',
    //         modal: true,
    //         dismissableMask: false,
    //         closable: true,
    //         contentStyle: { overflow: 'auto' },
    //         breakpoints: {
    //             '960px': '75vw',
    //             '640px': '90vw',
    //         },
    //         //!TODO:fix state service
    //         // data: {
    //         //     planStateService: this.planStateService,
    //         // },
    //         data: data,
    //     })
    // }

    onDeleteCase(id: string) {
        this.caseListStateService.deleteCase(id)
    }
}

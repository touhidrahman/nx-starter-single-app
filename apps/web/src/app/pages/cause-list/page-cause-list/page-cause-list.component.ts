import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { AuthStateService } from '@repo/auth'
import { CauseListDetailsCardComponent } from '@repo/cause-list'
import { PrimeModules } from '@repo/prime-modules'
import { CauseListStateService } from 'libs/cause-list/src/lib/cause-list-state.service'

@Component({
    selector: 'app-page-causelist',
    imports: [CommonModule, PrimeModules, CauseListDetailsCardComponent],
    templateUrl: './page-cause-list.component.html',
    styleUrl: './page-cause-list.component.css',
    providers: [CauseListStateService],
})
export class PageCauseListComponent {
    isFilterClicked = false
    isLoading = signal<boolean>(false)
    openCauseListId: string | null = null
    protected causeListStateService = inject(CauseListStateService)
    private authStateService = inject(AuthStateService)

    ngOnInit(): void {
        this.causeListStateService.init()
        this.setStateAndGroupId()
    }

    onSearch(value: Event) {}

    toggleFilter() {
        this.isFilterClicked = !this.isFilterClicked
    }

    private setStateAndGroupId() {
        this.causeListStateService.setState({
            groupId: this.authStateService.getGroupId() as string,
        })
    }
}

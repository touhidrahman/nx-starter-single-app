import { CommonModule } from '@angular/common'
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { AlertComponent } from '@repo/common-components'
import {
    CourtCardComponent,
    CourtsListStateService,
    CourtTableComponent,
    CreateCourtFormComponent,
} from '@repo/court'
import { PrimeModules } from '@repo/prime-modules'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-page-courts',
    imports: [
        CommonModule,
        ...PrimeModules,
        CourtTableComponent,
        CourtCardComponent,
        AlertComponent,
        FormsModule,
    ],
    templateUrl: './page-courts.component.html',
    styleUrl: './page-courts.component.scss',
    providers: [DialogService, DynamicDialogRef, CourtsListStateService],
})
export class PageCourtsComponent implements OnDestroy, OnInit {
    private ref = inject(DynamicDialogRef)
    courtsListStateService = inject(CourtsListStateService)
    dialogService = inject(DialogService)

    showNote = signal<boolean>(false)
    showFavoritesOnly = signal<boolean>(false)

    ngOnInit(): void {
        this.courtsListStateService.init()
    }

    showInfoAlert() {
        this.showNote.update((current) => !current)
    }

    onFavoriteToggle(event: any) {
        const newValue = event.checked
        this.showFavoritesOnly.set(newValue)

        this.courtsListStateService.setState({
            showFavoritesOnly: newValue,
            page: 1,
            size: newValue ? 10 : 20,
        })
    }
    closeNote() {
        this.showNote.set(false)
    }

    showCreateDialog() {
        this.openDialog(CreateCourtFormComponent, 'Add Court', 'create', '50vw', 'center')
    }

    //TODO: don't remove
    // showUploadDialog() {
    //     this.openDialog(
    //         UploadExcelFormComponent,
    //         'Upload Excel File',
    //         'upload',
    //         '60vw',
    //         'center',
    //     )
    // }

    openDialog(
        component: any,
        header: string,
        mode: 'create' | 'upload',
        width: string,
        position: string,
    ) {
        const ref = this.dialogService.open(component, {
            header: header,
            data: { mode },
            width: width,
            closable: true,
            position: position,
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
            },
        })
        ref?.onClose.subscribe((data) => {
            if (mode === 'create' && data) {
                const { courts } = this.courtsListStateService.getState()
                this.courtsListStateService.setState({
                    courts: [data, ...courts],
                })
            }
        })
    }

    onSearch(value: Event) {
        this.courtsListStateService.setState({
            search: (value.target as HTMLInputElement).value,
        })
    }

    ngOnDestroy() {
        if (this.ref) {
            this.ref?.close()
        }
    }
}

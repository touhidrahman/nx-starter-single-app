import { Component, ElementRef, HostListener, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { PrimeModules } from '@repo/prime-modules'
import { Action } from '../audit-log.model'
import { AuditLogStateService } from '../audit-log-state.service'

@Component({
    selector: 'lib-audit-log-filter',
    imports: [PrimeModules, FormsModule],
    templateUrl: './audit-log-filter.component.html',
    styleUrl: './audit-log-filter.component.scss',
})
export class AuditLogFilterComponent implements OnInit {
    auditLogStateService = inject(AuditLogStateService)
    showFilter = signal(false)
    selected = signal('')
    elementRef = inject(ElementRef)
    // selectedAction!: Action | null
    // actions: Action[] | undefined
    selectedAction = signal<Action | null>(null)
    actions = signal<Action[]>([{ name: 'create' }, { name: 'update' }, { name: 'delete' }])

    ngOnInit() {
        // this.actions = [
        //     {
        //         name: 'create'

        //     },
        //     {
        //         name: 'update'

        //     },
        //     {
        //         name: 'delete'

        //     }
        // ]

        this.auditLogStateService.init()
    }

    resetFilter() {
        this.auditLogStateService.setState({
            action: null,
        })
        this.selected.set('')
        this.selectedAction.set(null)
    }

    onFilter() {
        // const { action } = this.auditLogStateService.getState()
        // const selectedAction = this.auditLogStateService.setState({
        //     action: this.selectedAction?.name !== null ? this.selectedAction?.name : null
        // })
        const currentAction = this.selectedAction()?.name
        this.auditLogStateService.setState({
            action: this.selectedAction() ?? null,
        })
        // this.closeFilter()
    }

    closeFilter() {
        this.showFilter.set(false)
    }

    @HostListener('document:click', ['$event'])
    onOutsideClick(event: MouseEvent) {
        const clickedInside = this.elementRef.nativeElement.contains(event.target)
        if (!clickedInside) {
            this.closeFilter()
        }
    }
}

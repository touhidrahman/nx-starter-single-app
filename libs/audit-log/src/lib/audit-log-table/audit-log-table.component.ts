import { AsyncPipe, CommonModule, NgClass, SlicePipe } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { NoDataComponent } from '@repo/common-components'
import { PrimeModules } from '@repo/prime-modules'
import { TablePageEvent } from 'primeng/table'
import { ExpandedState } from '../audit-log.model'
import { AuditLogStateService } from '../audit-log-state.service'

@Component({
    selector: 'lib-audit-log-table',
    imports: [
        CommonModule,
        PrimeModules,
        NoDataComponent,
        AsyncPipe,
        NgClass,
        SlicePipe,
    ],
    templateUrl: './audit-log-table.component.html',
    styleUrl: './audit-log-table.component.scss',
    providers: [AuditLogStateService],
})
export class AuditLogTableComponent implements OnInit {
    auditLogsStateService = inject(AuditLogStateService)
    expandedStates = signal<Record<number, ExpandedState>>({})

    ngOnInit() {
        this.auditLogsStateService.init()
    }

    onPageChange({ first, rows }: TablePageEvent) {
        const page = first / rows + 1
        this.auditLogsStateService.setState({
            page: page,
            size: rows,
        })
    }

    toggleExpand(id: number, type: keyof ExpandedState): void {
        this.expandedStates.update((state) => ({
            ...state,
            [id]: {
                ...state[id],
                [type]: !state[id]?.[type],
            },
        }))
    }

    needsSeeMore(content: unknown): boolean {
        if (content == null) return false
        const str =
            typeof content === 'string' ? content : JSON.stringify(content)
        return str.length > 15
    }

    displayData(data: unknown): string {
        if (data == null) return String(data)
        if (typeof data === 'object') return JSON.stringify(data, null, 2)
        return String(data)
    }
}

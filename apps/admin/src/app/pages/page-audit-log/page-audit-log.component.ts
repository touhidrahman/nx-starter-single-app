import { Component, signal } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
    AuditLogFilterComponent,
    AuditLogStateService,
    AuditLogTableComponent,
} from '@repo/audit-log'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-page-audit-log',
    imports: [
        PrimeModules,
        AuditLogTableComponent,
        AuditLogFilterComponent,
        ReactiveFormsModule,
        FormsModule,
    ],
    templateUrl: './page-audit-log.component.html',
    styleUrl: './page-audit-log.component.scss',
    providers: [AuditLogStateService],
})
export class PageAuditLogComponent {
    isFilter = signal<boolean>(false)

    toggleFilter() {
        this.isFilter.set(!this.isFilter())
    }
}

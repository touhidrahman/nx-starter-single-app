import { CommonModule } from '@angular/common'
import { Component, inject, OnDestroy, signal } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import {
    AppointmentEditFormService,
    AppointmentListStateService,
} from '@repo/appointment'
import { PrimeModules } from '@repo/prime-modules'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'
import { AppointmentFilterComponent } from '../../main/appointment/components/appointment-filter/appointment-filter.component'
import { AppointmentFormComponent } from '../../main/appointment/components/appointment-form/appointment-form.component'
import { AppointmentTableComponent } from '../../main/appointment/components/appointment-table/appointment-table.component'

@Component({
    selector: 'app-page-appointments',
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        PrimeModules,
        ReactiveFormsModule,
        AppointmentFilterComponent,
        AppointmentTableComponent,
    ],
    templateUrl: './page-appointments.component.html',
    styleUrl: './page-appointments.component.scss',
    providers: [
        AppointmentListStateService,
        DialogService,
        AppointmentEditFormService,
        DynamicDialogRef,
    ],
})
export class PageAppointmentsComponent implements OnDestroy {
    private ref = inject(DynamicDialogRef)
    appointmentListStateService = inject(AppointmentListStateService)
    dialogService = inject(DialogService)
    editMode = signal(false)

    show(mode: 'create' | 'edit') {
        const ref = this.dialogService.open(AppointmentFormComponent, {
            header: 'Create Appointment',
            data: { mode },
            width: '50vw',
            closable: true,
            position: 'top',
        })
        ref?.onClose.subscribe((data) => {
            const { appointments } = this.appointmentListStateService.getState()
            if (mode === 'create' && data) {
                this.appointmentListStateService.setState({
                    appointments: [...appointments, data],
                })
            }
        })
    }

    onSearch(value: Event) {
        this.appointmentListStateService.setState({
            search: (value.target as HTMLInputElement).value,
        })
    }

    ngOnDestroy() {
        if (this.ref) {
            this.ref?.close()
        }
    }
}

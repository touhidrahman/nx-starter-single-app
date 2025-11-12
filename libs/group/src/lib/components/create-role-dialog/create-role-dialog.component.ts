import { Component, inject } from '@angular/core'

import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { PrimeModules } from '@repo/prime-modules'
import { DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-create-role-dialog',
    imports: [PrimeModules, ReactiveFormsModule],
    templateUrl: './create-role-dialog.component.html',
    styleUrl: './create-role-dialog.component.scss',
})
export class CreateRoleDialogComponent {
    formGroup!: FormGroup

    private ref = inject(DynamicDialogRef)

    ngOnInit() {
        this.formGroup = new FormGroup({
            email: new FormControl(''),
            description: new FormControl(''),
        })
    }

    onSubmit() {
        if (this.formGroup.valid) {
            this.ref?.close()
        }
    }

    onCancel() {
        this.ref?.close()
    }
}

import { Component, inject, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { CaseNotesComponent } from '@repo/case'

@Component({
    selector: 'app-page-case-notes',
    imports: [CaseNotesComponent],
    templateUrl: './page-case-notes.component.html',
    styleUrl: './page-case-notes.component.scss',
})
export class PageCaseNotesComponent {
    private activatedRoute = inject(ActivatedRoute)
    id = signal<string>('')

    ngOnInit(): void {
        this.activatedRoute.parent?.paramMap.subscribe((params) => {
            const paramId = params.get('id')
            this.id.set(paramId as string)
        })
    }
}

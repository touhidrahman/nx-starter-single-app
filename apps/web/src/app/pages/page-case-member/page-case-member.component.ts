import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute } from '@angular/router'
import { CaseMemberComponent } from '@repo/case'

@Component({
    selector: 'app-page-case-member',
    imports: [CommonModule, CaseMemberComponent],
    templateUrl: './page-case-member.component.html',
    styleUrl: './page-case-member.component.css',
})
export class PageCaseMemberComponent {
    private activatedRoute = inject(ActivatedRoute)
    caseId = signal<string>('')

    constructor() {
        this.activatedRoute.parent?.paramMap
            .pipe(takeUntilDestroyed())
            .subscribe((params) => {
                const paramId = params.get('id')
                if (paramId) {
                    this.caseId.set(paramId)
                }
            })
    }
}

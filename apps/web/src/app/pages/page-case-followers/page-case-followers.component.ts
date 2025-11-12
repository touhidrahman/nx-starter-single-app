import { Component, inject, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { CaseFollowRequestComponent } from '@repo/case'

@Component({
    selector: 'app-page-case-followers',
    imports: [CaseFollowRequestComponent],
    templateUrl: './page-case-followers.component.html',
    styleUrl: './page-case-followers.component.scss',
})
export class PageCaseFollowersComponent {
    private activatedRoute = inject(ActivatedRoute)
    id = signal<string>('')

    ngOnInit(): void {
        this.activatedRoute.parent?.paramMap.subscribe((params) => {
            const paramId = params.get('id')
            this.id.set(paramId as string)
        })
    }
}

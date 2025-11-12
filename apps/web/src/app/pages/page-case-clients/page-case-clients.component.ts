import { Component, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { CaseClientComponent } from '@repo/case'

@Component({
    selector: 'app-page-case-clients',
    imports: [CaseClientComponent],
    templateUrl: './page-case-clients.component.html',
    styleUrl: './page-case-clients.component.scss',
})
export class PageCaseClientsComponent implements OnInit {
    private activatedRoute = inject(ActivatedRoute)
    id = signal<string>('')

    ngOnInit(): void {
        this.activatedRoute.parent?.paramMap.subscribe((params) => {
            const paramId = params.get('id')
            this.id.set(paramId as string)
        })
    }
}

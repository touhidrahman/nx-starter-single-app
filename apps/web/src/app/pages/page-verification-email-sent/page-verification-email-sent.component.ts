import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-page-verification-email-sent',
    imports: [CommonModule, PrimeModules, RouterLink],
    templateUrl: './page-verification-email-sent.component.html',
    styleUrl: './page-verification-email-sent.component.css',
})
export class PageVerificationEmailSentComponent implements OnInit {
    private activatedRoute = inject(ActivatedRoute)

    isReset = signal<boolean>(false)

    ngOnInit(): void {
        this.isReset.set(this.activatedRoute.snapshot.queryParams['isReset'])
    }
}

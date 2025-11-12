import { Component, inject } from '@angular/core'
import { NoDataComponent } from '@repo/common-components'
import { PrimeModules } from '@repo/prime-modules'
import { ClaimStateService } from '@repo/role-permission'
import { AccordionModule } from 'primeng/accordion'

@Component({
    selector: 'app-page-claim',
    imports: [...PrimeModules, NoDataComponent, AccordionModule],
    templateUrl: './page-claim.component.html',
    styleUrl: './page-claim.component.scss',
    providers: [ClaimStateService],
})
export class PageClaimComponent {
    public claimStateService = inject(ClaimStateService)
}

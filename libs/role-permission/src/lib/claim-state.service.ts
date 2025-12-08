import { computed, Injectable, inject, signal } from '@angular/core'
import { groupBy } from 'es-toolkit'
import { derivedAsync } from 'ngxtension/derived-async'
import { map } from 'rxjs'
import { Claim } from './claim.model'
import { ClaimApiService } from './claim-api.service'

@Injectable()
export class ClaimStateService {
    private claimApiService = inject(ClaimApiService)
    groupId = signal<string>('')

    claims = derivedAsync(
        () => this.claimApiService.getAll(this.groupId()).pipe(map((x) => x.data)),
        { initialValue: [] },
    )

    claimIds = computed(() => this.claims().map((c: Claim) => c.id))

    groupedClaims = computed(() => groupBy(this.claims(), (item) => item.section || 'General'))

    groupedClaimSections = computed(() => Object.keys(this.groupedClaims()).sort())

    hasClaim(claimId: string): boolean {
        return this.claimIds().includes(claimId)
    }
}

import { CommonModule } from '@angular/common'
import { Component, input } from '@angular/core'
import { PrimeModules } from '@repo/prime-modules'
import { Subscription } from '../subscriptions.model'

@Component({
    selector: 'app-current-subscription-card',
    imports: [CommonModule, PrimeModules],
    templateUrl: './current-subscription-card.component.html',
    styleUrl: './current-subscription-card.component.css',
})
export class CurrentSubscriptionCardComponent {
    subscription = input<Subscription | null>(null)
}

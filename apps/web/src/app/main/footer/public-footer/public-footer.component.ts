import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AppDetailsService } from '@repo/common-services'

@Component({
    selector: 'app-public-footer',
    imports: [RouterLink],
    templateUrl: './public-footer.component.html',
    styleUrl: './public-footer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [AppDetailsService],
})
export class PublicFooterComponent {
    private appDetailsService = inject(AppDetailsService)
    year = new Date().getFullYear()
    version = signal<string>(this.appDetailsService.getAppDetails().version)
}

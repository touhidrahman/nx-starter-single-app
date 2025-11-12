import { Component, inject } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { AuthStateService } from '../auth-state.service'

@Component({
    imports: [RouterLink],
    templateUrl: './page-create-profile.component.html',
    styleUrl: './page-create-profile.component.css',
})
export class PageCreateProfileComponent {
    private authStateService = inject(AuthStateService)
    private router = inject(Router)

    ngOnInit(): void {
        const { group, user } = this.authStateService.getState()
        if (group && user) {
            this.router.navigateByUrl('/')
        }
    }
}

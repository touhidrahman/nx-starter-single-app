import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'

@Component({
    selector: 'app-lawyer-search',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './lawyer-search.component.html',
    styleUrl: './lawyer-search.component.scss',
})
export class LawyerSearchComponent {
    private router = inject(Router)
    searchText = ''

    onInputFocus(customPlaceHolder: HTMLSpanElement) {
        customPlaceHolder.classList.add('hidden')
    }

    onBlur(customPlaceHolder: HTMLSpanElement, inputFeild: HTMLInputElement) {
        if (inputFeild.value) return
        customPlaceHolder.classList.remove('hidden')
    }

    onSearchRedirect() {
        const search = this.searchText.trim()

        if (search) {
            this.router.navigate(['/lawyers'], { queryParams: { search } })
        } else {
            this.router.navigate(['/lawyers'])
        }
    }
}

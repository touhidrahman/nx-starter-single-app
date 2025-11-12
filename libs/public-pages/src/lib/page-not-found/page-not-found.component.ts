import { Component } from '@angular/core'

@Component({
    selector: 'app-page-not-found',
    imports: [],
    template: `
        <div class="error-page flex items-center justify-center">
            <div class="error-container mt-8 justify-items-center text-center">
                <h1 class="error-code mb-0 dark:opacity-70">404</h1>
                <h2 class="-mt-8 mb-3 text-5xl secondary-text">Page Not Found!</h2>
                <p class="lead error-message mb-5 secondary-text">
                    We can't seem to find the page you're looking for.
                </p>
                <div class="d-flex justify-content-center gap-3">
                    <a
                        href="/"
                        class="text-white primary-text-2 rounded-md bg-[#22c55e] bg-color-primary px-4 py-2"
                        >Return Home<i class="pi pi-reply rotate-180 ml-2"></i></a
                    >
                </div>
            </div>
        </div>
    `,
    styleUrl: './page-not-found.component.css',
})
export class PageNotFoundComponent {}

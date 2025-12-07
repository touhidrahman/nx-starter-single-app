import { CommonModule } from '@angular/common'
import { Component, computed, ElementRef, input, output, signal, viewChild } from '@angular/core'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'app-search-input',
    imports: [CommonModule, PrimeModules],
    template: `
   <div class="flex max-w-lg items-center">
  <label for="search-box" class="sr-only">Search</label>
  <div class="relative w-full">
    <input
      #searchBox
      pInputText
      id="search-box"
      type="text"
      class="block w-96"
      [placeholder]="placeholder()"
      [value]="search()"
      (input)="onInput($event)"
      (keydown.enter)="onSubmit()" />

    @if (showClearButton()) {
      <p-button
        type="button"
        [text]="true"
        severity="danger"
        class="absolute inset-y-0 end-0 flex items-center pe-1"
        (click)="clearSearch()">
        <i class="pi pi-times"></i>
      </p-button>
    }
  </div>

  <p-button
    icon="pi pi-search"
    label="Search"
    [disabled]="isDisabled()"
    class="ms-2"
    (onClick)="onSubmit()">
  </p-button>
</div>
   `,
})
export class SearchInputComponent {
    placeholder = input('Search...')
    clearable = input(true)

    searchSubmit = output<string>()
    searchCleared = output<void>()

    searchBox = viewChild<ElementRef<HTMLInputElement>>('searchBox')
    search = signal('')

    showClearButton = computed(() => this.clearable() && this.search().length > 0)

    isDisabled = computed(() => !this.search().trim())

    onInput(event: Event) {
        const value = (event.target as HTMLInputElement).value
        this.search.set(value)
    }

    onSubmit() {
        const term = this.search().trim()
        if (term) {
            this.searchSubmit.emit(term)
        }
    }

    clearSearch() {
        this.search.set('')
        this.searchBox()?.nativeElement.focus()
        this.searchCleared.emit()
    }
}

import {
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Output,
} from '@angular/core'

@Directive({
    selector: '[clickOutside]',
})
export class ClickOutsideDirective {
    @Output() clickOutside = new EventEmitter<MouseEvent>()

    constructor(private elementRef: ElementRef) {}

    @HostListener('document:mousedown', ['$event'])
    onClick(event: MouseEvent) {
        const target = event.target as HTMLElement
        if (!this.elementRef.nativeElement.contains(target)) {
            this.clickOutside.emit(event)
        }
    }
}

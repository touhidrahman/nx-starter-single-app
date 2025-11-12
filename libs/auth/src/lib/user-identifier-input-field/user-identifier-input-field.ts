import { CommonModule } from '@angular/common'
import {
    Component,
    effect,
    Injector,
    inject,
    input,
    OnInit,
    output,
    signal,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import {
    ControlValueAccessor,
    NgControl,
    ReactiveFormsModule,
} from '@angular/forms'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'user-identifier-input-field',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, PrimeModules],
    template: `
  <div>
    <p-iconfield>
      <input
        [id]="id()"
        [type]="type()"
        pInputText
        [value]="value() ?? ''"
        [placeholder]="placeholder()"
        [required]="required()"
        [disabled]="disabled()"
        class="w-full"
        (input)="handleInput($event)"
        (blur)="handleBlur()"
      />

      @if (isChecking()) {
        <p-inputicon class="pi pi-spinner pi-spin text-green-600" />
      }
    </p-iconfield>

    @for (msg of errorMessages(); track msg) {
      <small class="mt-1 block text-sm text-red-500">{{ msg }}</small>
    }
  </div>
  `,
})
export class UserIdentifierInputFieldComponent
    implements ControlValueAccessor, OnInit
{
    private injector = inject(Injector)
    private ngControl = inject(NgControl, { optional: true, self: true })

    id = input<string>('input-field')
    label = input.required<string>()
    type = input<string>('text')
    placeholder = input<string>('')
    required = input<boolean>(false)
    isChecking = input<boolean>(false)
    patternErrorMsgText = input<string>('')

    value = signal<any>(null)
    disabled = signal<boolean>(false)
    errorMessages = signal<string[]>([])

    onFieldInput = output<void>()
    onFieldBlur = output<void>()

    private onChange: (v: any) => void = () => {}
    private onTouched: () => void = () => {}

    private valueChangesSig: (() => unknown) | null = null
    private statusChangesSig: (() => unknown) | null = null

    private touchedTick = signal(0)

    constructor() {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this
        }

        const map: Record<string, (e?: any) => string> = {
            required: () => `${this.label()} is required`,
            email: () => 'Please enter a valid email address',
            pattern: () => `${this.patternErrorMsgText()}`,
            minlength: (e) => `Minimum length is ${e?.requiredLength}`,
            maxlength: (e) => `Maximum length is ${e?.requiredLength}`,
        }

        effect(
            () => {
                this.valueChangesSig?.()
                this.statusChangesSig?.()
                this.touchedTick()

                const ctrl = this.ngControl?.control ?? null
                if (!ctrl) {
                    this.errorMessages.set([])
                    return
                }

                const { errors, touched, dirty } = ctrl
                if (!errors || (!touched && !dirty)) {
                    this.errorMessages.set([])
                    return
                }

                this.errorMessages.set(
                    Object.keys(errors)
                        .map((k) => map[k]?.(errors[k]))
                        .filter(Boolean) as string[],
                )
            },
            { injector: this.injector },
        )
    }

    ngOnInit(): void {
        const ctrl = this.ngControl?.control ?? null
        if (ctrl) {
            this.valueChangesSig = toSignal(ctrl.valueChanges, {
                initialValue: ctrl.value,
                injector: this.injector,
            })
            this.statusChangesSig = toSignal(ctrl.statusChanges, {
                initialValue: ctrl.status,
                injector: this.injector,
            })
        }
    }

    writeValue(v: any): void {
        this.value.set(v ?? (this.type() === 'number' ? null : ''))
    }

    registerOnChange(fn: any): void {
        this.onChange = fn
    }
    registerOnTouched(fn: any): void {
        this.onTouched = fn
    }
    setDisabledState(isDisabled: boolean): void {
        this.disabled.set(isDisabled)
    }

    handleInput(event: Event) {
        const v = (event.target as HTMLInputElement).value
        this.value.set(v)
        this.onChange(v)
        this.onFieldInput.emit()
    }

    handleBlur() {
        this.onTouched()
        this.touchedTick.update((n) => n + 1)
        this.onFieldBlur.emit()
    }
}

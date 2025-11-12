import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'
import { RegexBangladeshPhone, RegexEmailPattern } from './regex.util'

export const identifierValidator: ValidatorFn = (
    control: AbstractControl,
): ValidationErrors | null => {
    const value = control.value?.trim()
    if (!value) return null

    const isValidPhone = RegexBangladeshPhone.test(value)
    const isValidEmail = RegexEmailPattern.test(value)

    if (isValidPhone || isValidEmail) return null

    if (value.includes('@')) return { invalidEmail: true }
    if (/[0-9]/.test(value)) return { invalidPhone: true }
    return { invalidIdentifier: true }
}

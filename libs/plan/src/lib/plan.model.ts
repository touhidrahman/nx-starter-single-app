export enum PlanRenewalType {
    Auto = 'auto',
    Manually = 'manually',
}

export interface PlanDto {
    name: string
    description?: string
    monthlyPrice: number
    yearlyPrice: number
    discountPrice?: number
    discountPeriodStart?: Date
    discountPeriodEnd?: Date
    currency: string
    isActive: boolean
    storageLimit: number
    maxUsers: number
    maxCases: number
    monthlySmsLimit: number
    monthlyAiCredits: number
    activeFeatures?: string[]
    inactiveFeatures?: string[]
    trialPeriodDays?: number
}

export interface Plan extends PlanDto {
    id: string
    createdAt: Date
    updatedAt: Date
}

export type PlanFormDialogData = {
    plan: Plan | null
}

export type PlanFormDialogResult = {
    plan: Plan | null
    isEdit: boolean
}

export type RenewalType = 'auto' | 'manual'

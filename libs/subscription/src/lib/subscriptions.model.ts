export enum SubscriptionStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}
export enum SubscriptionType {
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
}

export interface SubscriptionDto {
    groupId: string
    planId: string
    planName: string
    startDate?: Date
    endDate?: Date
    isTrial: boolean
    autoRenewal: boolean
    paymentMethod?: string
    transactionId?: string
    usedStorage?: number
    status: SubscriptionStatus
    statusChangeDate?: Date
    subscriptionType: SubscriptionType
    paymentNumber?: string
}

export interface Subscription extends SubscriptionDto {
    id: string
    createdAt: Date
    updatedAt: Date
}

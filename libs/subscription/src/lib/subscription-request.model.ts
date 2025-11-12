export interface SubscriptionRequestDto {
    status: 'active' | 'inactive'
    groupId: string
    planId: string
    subscriptionType: 'monthly' | 'yearly'
    isTrial?: boolean
    autoRenewal?: boolean
    paymentMethod?: string
    transactionId?: string
    statusChangeDate?: string
}
export interface SubscriptionRequest extends SubscriptionRequestDto {
    id?: string
    groupName?: string
    plan?: string
    createdAt?: Date
    updatedAt?: Date
}

export interface ApproveSubscriptionRequest {
    groupId: string
    id: string
}

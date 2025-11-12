export interface ReferralCode {
    userId: string
    groupId: string
    referralCode: string
    id: string
    createdAt: Date
}

export interface ReferredUser {
    firstName: string
    lastName: string
    email: string
}

export interface ReferralPoints {
    myPoints: {
        myPoints: number
        planName: string
    }
    referredPoints: number
    totalPoints: number
}

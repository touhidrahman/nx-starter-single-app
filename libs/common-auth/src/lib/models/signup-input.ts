export interface SignupInput {
    email: string
    password: string
    firstName: string
    lastName: string
    defaultGroupId?: string
    role?: string
    organization?: {
        groupType: 'client' | 'vendor'
        name: string
    }
    phone?: string
}
export interface AdminSignupInput {
    email: string
    password: string
    confirmPassword: string
    name: string
}

export interface SignupForm extends SignupInput {
    acceptTerms: boolean
}

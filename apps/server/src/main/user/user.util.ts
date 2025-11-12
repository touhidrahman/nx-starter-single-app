import { User } from './user.schema'

export function passwordRemoved(user: User): User {
    return { ...user, password: '' }
}

export const validateEnum = <T extends string>(
    value: string | undefined,
    validOptions: T[],
): T | undefined => {
    return validOptions.includes(value as T) ? (value as T) : undefined
}

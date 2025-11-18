export function passwordRemoved<T extends { password: string }>(user: T): T {
    return { ...user, password: '' }
}

export const validateEnum = <T extends string>(
    value: string | undefined,
    validOptions: T[],
): T | undefined => {
    return validOptions.includes(value as T) ? (value as T) : undefined
}

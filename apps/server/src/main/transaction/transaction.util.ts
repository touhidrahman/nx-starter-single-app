export function withSign(amount: number | string | undefined): number {
    if (amount === undefined) {
        return 0
    }
    const amt = Number.parseFloat(amount as string)
    return amt
}

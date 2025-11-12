import { Member } from '../../main/user/user.schema'
import { findUserBasicInfoById } from '../../main/user/user.service'

export async function attachCreatorInfo<T extends { creatorId: string | null }>(
    items: T[],
): Promise<(T & { creator: Member | null })[]> {
    return Promise.all(
        items.map(async (item) => {
            const creator = item.creatorId
                ? await findUserBasicInfoById(item.creatorId)
                : null

            return {
                ...item,
                creator,
            }
        }),
    )
}
export async function attachCreatorInfoById<
    T extends { creatorId: string | null },
>(item: T): Promise<T & { creator: Member | null }> {
    const creator = item.creatorId
        ? await findUserBasicInfoById(item.creatorId)
        : null

    return {
        ...item,
        creator,
    }
}

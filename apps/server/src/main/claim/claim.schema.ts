import { z } from 'zod'
import { groupTypeEnum } from '../../core/db/schema'

export const zSelectClaim = z.object({
    id: z.string(),
    description: z.string(),
    section: z.string(),
    groupType: groupTypeEnum,
})

export type SelectClaim = z.infer<typeof zSelectClaim>

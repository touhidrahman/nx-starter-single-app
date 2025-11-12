import { z } from 'zod'

export const zSelectClaim = z.object({
    id: z.string(),
    description: z.string(),
    section: z.string(),
})

export type SelectClaim = z.infer<typeof zSelectClaim>

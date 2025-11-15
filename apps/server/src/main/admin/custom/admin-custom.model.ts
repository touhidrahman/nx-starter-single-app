import { z } from 'zod'

export type RegisterAdmin = z.infer<typeof zRegisterAdmin>

export const zRegisterAdmin = z.object({
    name: z.string().min(1).max(100),
    email: z.email().max(255),
    password: z.string().min(8).max(64),
})

import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { usersTable } from '../../core/db/schema'

export type UserDto = typeof usersTable.$inferInsert
export type User = typeof usersTable.$inferSelect
export type UserWithoutPassword = Omit<User, 'password'>

export const zInsertUser = createInsertSchema(usersTable)
export const zSelectUser = createSelectSchema(usersTable)
export const zSelectUserWithoutPass = createSelectSchema(usersTable)
    .omit({
        password: true,
    })
    .strip()
export const zUpdateUser = createInsertSchema(usersTable).partial()
export const zSearchUser = zSelectUser
    .pick({
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        city: true,
        country: true,
        postCode: true,
    })
    .extend({
        page: z.string().optional(),
        size: z.string().optional(),
        search: z.string().optional(),
    })
    .partial()

export const zUpdateProfile = createSelectSchema(usersTable).omit({
    email: true,
})

export const zProfilePicture = z.object({
    file: z.instanceof(File).optional(),
})
export const zProfile = createInsertSchema(usersTable)
    .omit({ email: true })
    .extend({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        postCode: z.string().optional(),
        address: z.string().optional(),
    })
    .partial()

export interface Member {
    id: string
    email: string
    firstName: string
    lastName: string
    profilePhoto: string | null
}

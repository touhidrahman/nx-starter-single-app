import { createSchemaFactory } from 'drizzle-zod'

export const { createInsertSchema, createSelectSchema, createUpdateSchema } =
    createSchemaFactory({
        coerce: {
            date: true,
            boolean: true,
            number: true,
            string: true,
        },
    })

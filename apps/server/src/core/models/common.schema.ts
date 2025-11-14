import { orderBy } from 'es-toolkit'
import { sort } from 'radash'
import { z } from 'zod'

// Define a schema for a date-time string
export const zDateTimeString = z.string().refine(
    (val) => {
        // Check if the string is a valid date-time format
        return !Number.isNaN(Date.parse(val))
    },
    {
        message: 'Invalid date-time string',
    },
)

export const zIds = z.object({
    ids: z.array(z.string()).min(1),
})

export const zId = z.object({
    id: z.string(),
})

export const zEmpty = z.object({})
export const zEmptyList = z.array(z.object({})).length(0)
export const zSearch = z.object({
    search: z.string().optional(),
    ids: z.array(z.string()).optional(),
})
export const zPagination = z.object({
    page: z.number().min(1).optional(),
    size: z.number().min(1).max(100).optional(),
    orderBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
})

export const zFile = z.object({
    file: z.instanceof(File).optional(),
    files: z.array(z.instanceof(File)).optional(),
})

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
export const zFileWithCheck = z.object({
    file: z.custom<File>(
        (file) => {
            if (!(file instanceof File)) {
                return false
            }
            // Check file type (e.g., image/jpeg or image/png)
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
            if (!allowedTypes.includes(file.type)) {
                return false
            }
            if (file.size > MAX_FILE_SIZE) {
                return false
            }
            return true
        },
        {
            message: `Invalid file. Ensure it's an image (JPEG/PNG/PDF) and under ${MAX_FILE_SIZE / 1024 / 1024} MB.`,
        },
    ),
})

import { z } from '@hono/zod-openapi'
import {
    ZodAny,
    ZodArray,
    ZodBoolean,
    ZodNumber,
    ZodObject,
    ZodOptional,
    ZodString,
} from 'zod'
//TODO:  Zod version 4.1.5, AnyZodObject doesn't exist.
// export type ZodSchema = z.AnyZodObject | z.ZodArray<z.AnyZodObject>
export type ZodSchema = ZodObject<any> | ZodArray<ZodObject<any>>

export function ApiResponse<T extends ZodSchema>(
    dataSchema: T,
    description: string,
): {
    content: {
        'application/json': {
            schema: ZodObject<{
                data: T
                message: ZodString
                success: ZodBoolean
                error: ZodOptional<ZodAny>
                meta: ZodOptional<ZodAny>
                pagination: ZodOptional<
                    ZodObject<{
                        page: ZodNumber
                        size: ZodNumber
                        total: ZodNumber
                    }>
                >
            }>
        }
    }
    description: string
} {
    return {
        content: {
            'application/json': {
                schema: z.object({
                    data: dataSchema,
                    message: z.string(),
                    success: z.boolean(),
                    error: z.any().optional(),
                    meta: z.any().optional(),
                    pagination: z
                        .object({
                            page: z.number(),
                            size: z.number(),
                            total: z.number(),
                        })
                        .optional(),
                }),
            },
        },
        description,
    }
}

export function buildApiResponse<T>(
    data: T,
    message: string,
    success: boolean,
): {
    data: T
    message: string
    success: boolean
} {
    return {
        data,
        message,
        success,
    }
}

// 1. Base Stream Schema
export const zStreamResponse = z.object({
    body: z.custom<ReadableStream>((val) => val instanceof ReadableStream, {
        message: 'Body must be a ReadableStream',
    }),
    headers: z
        .object({
            'Content-Type': z.string().default('application/octet-stream'),
            'Content-Disposition': z
                .string()
                .refine((val) => val.startsWith('inline; filename="'), {
                    message: 'Must follow format: inline; filename="..."',
                }),
        })
        .optional(),
})

// 2. Generic API Response for ReadableStream
export function StreamResponse(description: string) {
    return {
        content: {
            'application/octet-stream': {
                schema: zStreamResponse,
            },
        },
        description,
    }
}

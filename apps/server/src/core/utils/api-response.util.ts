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

export type ZodSchema = ZodObject<any> | ZodArray<ZodObject<any>>

export const zResponsePagination = z.object({
    page: z.number(),
    size: z.number(),
    total: z.number(),
    totalPages: z.number(),
})

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
                }),
            },
        },
        description,
    }
}

export function ApiListResponse<T extends ZodSchema>(
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
                pagination: ZodObject<{
                    page: ZodNumber
                    size: ZodNumber
                    total: ZodNumber
                    totalPages: ZodNumber
                }>
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
                    pagination: zResponsePagination,
                }),
            },
        },
        description,
    }
}

export function respond<T>(
    data: T,
    message: string,
    success: boolean,
    error?: any,
    meta?: any,
): {
    data: T
    message: string
    success: boolean
    error?: any
    meta?: any
} {
    return {
        data,
        message,
        success,
        error,
        meta,
    }
}

export function respondList<T>(
    data: T[],
    message: string,
    success: boolean,
    page: number,
    size: number,
    total: number,
): {
    data: T[]
    message: string
    success: boolean
    pagination: {
        page: number
        size: number
        total: number
        totalPages: number
    }
} {
    return {
        data,
        message,
        success,
        pagination: {
            page,
            size,
            total,
            totalPages: Math.ceil(total / size),
        },
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

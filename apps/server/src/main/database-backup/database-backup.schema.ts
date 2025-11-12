import z from 'zod'

export const zDdBackupRecord = z.object({
    lastModified: z.date(),
    filename: z.string(),
    size: z.number(),
    year: z.number(),
    month: z.number(),
    key: z.string(),
})

export interface BackupStats {
    total: number
    kept: number
    deleted: number
    targetMonth: string
    oldest: Date | null
    newest: Date | null
}

export type DbBackupRecord = z.infer<typeof zDdBackupRecord>

export interface RemovalOptions {
    month?: number
    year?: number
    auto?: boolean
}

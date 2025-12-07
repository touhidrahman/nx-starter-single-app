import {
    DeleteObjectsCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
} from '@aws-sdk/client-s3'
import DateFnsUtils from '@date-io/date-fns'
import { spawn } from 'child_process'
import { format, parse } from 'date-fns'
import env from '../../env'
import { databaseBackupS3Client } from '../../third-party/s3.service'
import { DbBackupRecord, RemovalOptions } from './database-backup.schema'

export function getBackupFileName(date: Date = new Date()): string {
    return `${format(date, 'yyyy-MMM-dd')}-backup.dump`.toLowerCase()
}

export async function createDatabaseBackup(): Promise<string> {
    const backupFileName = getBackupFileName()
    try {
        const backupData = await pgDumpToBuffer()
        await uploadToS3(backupData, backupFileName)
        return `database-backup/${backupFileName}`
    } catch (error) {
        throw new Error(
            `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
    }
}

function pgDumpToBuffer(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const connectionString = env.DATABASE_URL ?? ''
        if (!connectionString) {
            reject(new Error('DATABASE_URL environment variable is required'))
            return
        }

        const pgDump = spawn('pg_dump', [connectionString, '-F', 'c', '-Z', '9'])

        const chunks: Buffer[] = []
        let totalLength = 0

        pgDump.stdout.on('data', (chunk: Buffer) => {
            chunks.push(chunk)
            totalLength += chunk.length
        })

        pgDump.stderr.on('data', (data) => {
            console.error(`pg_dump stderr: ${data}`)
        })

        pgDump.on('close', (code) => {
            if (code === 0) {
                const buffer = Buffer.concat(chunks, totalLength)

                resolve(buffer)
            } else {
                reject(new Error(`pg_dump process exited with code ${code}`))
            }
        })

        pgDump.on('error', (err) => reject(err))
    })
}

async function uploadToS3(buffer: Buffer, fileName: string): Promise<void> {
    try {
        const command = new PutObjectCommand({
            Bucket: env.S3_BUCKET,
            Key: `database-backup/${fileName}`,
            Body: buffer,
            ContentType: 'application/octet-stream',
        })
        await databaseBackupS3Client.send(command)
    } catch (error: any) {
        if (error.$metadata) {
            console.error('HTTP Status:', error.$metadata.httpStatusCode)
        }
        throw new Error(`S3 upload failed: ${error.message}`)
    }
}

function extractDateFromFilename(filename: string): Date | null {
    try {
        const match = filename.match(/^(\d{4})-([a-z]{3})-(\d{2})-backup\.dump$/)
        if (!match) return null

        const dateStr = `${match[1]}-${match[2]}-${match[3]}`
        return parse(dateStr, 'yyyy-MMM-dd', new Date())
    } catch {
        return null
    }
}

export async function listDatabaseBackups(): Promise<DbBackupRecord[]> {
    try {
        const command = new ListObjectsV2Command({
            Bucket: env.S3_BUCKET,
            Prefix: 'database-backup/',
        })

        const response = await databaseBackupS3Client.send(command)

        return (
            response.Contents?.map((obj) => {
                const lastModified = obj.LastModified!
                const filename = obj.Key!.split('/').pop() || ''
                const creationDate = extractDateFromFilename(filename) || lastModified

                return {
                    key: obj.Key!,
                    lastModified,
                    filename,
                    size: obj.Size || 0,
                    month: creationDate.getMonth() + 1,
                    year: creationDate.getFullYear(),
                }
            }).filter((item) => item.key.endsWith('.dump')) || []
        )
    } catch (error) {
        throw new Error('Failed to list backups from S3')
    }
}

const dateUtils = new DateFnsUtils()

export function selectMonthForDeletion(): {
    month: number
    year: number
    name: string
} {
    const sixMonthsAgo = dateUtils.addMonths(new Date(), -6)
    const monthName = dateUtils.format(sixMonthsAgo, 'normalDate').split(' ')[0]
    const shortMonthName = monthName.toLowerCase().substring(0, 3).toUpperCase()

    return {
        month: dateUtils.getMonth(sixMonthsAgo) + 1,
        year: dateUtils.getYear(sixMonthsAgo),
        name: shortMonthName,
    }
}

export async function removeBackups(options: RemovalOptions = { auto: true }): Promise<void> {
    const backups = await listDatabaseBackups()

    if (backups.length === 0) {
        return
    }

    let targetMonth: number
    let targetYear: number

    if (options.month !== undefined && options.year !== undefined) {
        targetMonth = options.month
        targetYear = options.year
    } else if (options.month !== undefined) {
        targetMonth = options.month
        targetYear = new Date().getFullYear()
    } else {
        const target = selectMonthForDeletion()
        targetMonth = target.month
        targetYear = target.year
    }

    const backupsToDelete = backups.filter(
        (backup) => backup.month === targetMonth && backup.year === targetYear,
    )

    if (backupsToDelete.length === 0) {
        return
    }
    await deleteBackupsInBatches(backupsToDelete)
}

async function deleteBackupsInBatches(backupsToDelete: DbBackupRecord[]): Promise<void> {
    const batchSize = 1000

    for (let i = 0; i < backupsToDelete.length; i += batchSize) {
        const batch = backupsToDelete.slice(i, i + batchSize)

        const command = new DeleteObjectsCommand({
            Bucket: env.S3_BUCKET,
            Delete: {
                Objects: batch.map((item) => ({ Key: item.key })),
            },
        })

        await databaseBackupS3Client.send(command)
    }
}

export async function findBackupFileByName(fileName: string): Promise<DbBackupRecord | null> {
    const backups = await listDatabaseBackups()
    return backups.find((backup) => backup.filename === fileName) || null
}

export async function downloadBackupFile(fileName: string): Promise<Buffer> {
    const command = new GetObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: `database-backup/${fileName}`,
    })

    const response = await databaseBackupS3Client.send(command)

    const body = (response as any).Body
    if (!body) {
        throw new Error('No data found in the backup file')
    }

    const chunks: Buffer[] = []
    for await (const chunk of body) {
        chunks.push(chunk)
    }

    return Buffer.concat(chunks)
}

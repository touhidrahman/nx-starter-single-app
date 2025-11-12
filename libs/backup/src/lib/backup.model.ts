export interface Backup {
    filename: string
    key: string
    lastModified: Date
    size: number
    month: number
    year: number
}

export interface BackupDownload {
    filePath: string
}

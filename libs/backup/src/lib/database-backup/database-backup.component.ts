import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { NoDataComponent } from '@repo/common-components'
import { ApiResponse } from '@repo/common-models'
import { FileSizePipe } from '@repo/common-pipes'
import { PrimeModules } from '@repo/prime-modules'
import { Backup } from '../backup.model'
import { BackupApiService } from '../backup-api.service'

@Component({
    selector: 'app-database-backup',
    imports: [CommonModule, PrimeModules, NoDataComponent, FileSizePipe],
    templateUrl: './database-backup.component.html',
    styleUrl: './database-backup.component.css',
})
export class DatabaseBackupComponent implements OnInit {
    private backupApiService = inject(BackupApiService)

    isLoading = signal<boolean>(false)
    databaseBackups = signal<Backup[]>([])
    isDownloading = signal<boolean>(false)

    ngOnInit(): void {
        this.loadBackupDataList()
    }

    private loadBackupDataList() {
        this.isLoading.set(true)
        this.backupApiService.find().subscribe({
            next: (res: ApiResponse<Backup[]>) => {
                this.databaseBackups.set([...res.data])
                this.isLoading.set(false)
            },
            error: () => {
                this.isLoading.set(false)
            },
        })
    }

    protected downloadBackup(fileName: string) {
        this.isDownloading.set(true)
        this.backupApiService.downloadBackup(fileName).subscribe({
            next: (res: Blob) => {
                const url = window.URL.createObjectURL(res)
                const a = document.createElement('a')
                a.href = url
                a.download = fileName
                a.click()
                window.URL.revokeObjectURL(url)
                this.isDownloading.set(false)
            },
            error: () => {
                this.isDownloading.set(false)
            },
        })
    }
}

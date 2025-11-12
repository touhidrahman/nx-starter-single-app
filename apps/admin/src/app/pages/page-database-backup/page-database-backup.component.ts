import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { DatabaseBackupComponent } from '@repo/backup'

@Component({
    selector: 'app-page-database-backup',
    imports: [CommonModule, DatabaseBackupComponent],
    templateUrl: './page-database-backup.component.html',
    styleUrl: './page-database-backup.component.css',
})
export class PageDatabaseBackupComponent {}

import { ChangeDetectionStrategy, Component, signal } from '@angular/core'
import { environment } from '../../../../../environment/environment'

@Component({
    selector: 'app-download-app',
    imports: [],
    templateUrl: './download-app.component.html',
    styleUrl: './download-app.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadAppComponent {
    isIos = signal<boolean>(environment.platform === 'ios')
}

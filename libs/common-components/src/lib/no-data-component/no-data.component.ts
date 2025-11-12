import { ChangeDetectionStrategy, Component, input } from '@angular/core'

@Component({
    selector: 'lib-no-data',
    imports: [],
    templateUrl: './no-data.component.html',
    styleUrl: './no-data.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoDataComponent {
    noDataMessage = input<string>('No Data Found')
}

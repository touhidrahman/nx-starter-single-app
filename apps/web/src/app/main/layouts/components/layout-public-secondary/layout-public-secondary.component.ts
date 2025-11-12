import { Component } from '@angular/core'
import { PublicFooterComponent } from '../../../footer/public-footer/public-footer.component'
import { HeaderPublicSecondaryComponent } from '../../../headers/components/header-public-secondary/header-public-secondary.component'

@Component({
    selector: 'app-layout-public-secondary',
    imports: [HeaderPublicSecondaryComponent, PublicFooterComponent],
    templateUrl: './layout-public-secondary.component.html',
    styleUrl: './layout-public-secondary.component.scss',
})
export class LayoutPublicSecondaryComponent {}

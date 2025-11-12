import { Component } from '@angular/core'
import { PublicFooterComponent } from '../../../footer/public-footer/public-footer.component'
import { HeaderPublicComponent } from '../../../headers/components/header-public/header-public.component'

@Component({
    selector: 'app-layout-public',
    imports: [HeaderPublicComponent, PublicFooterComponent],
    templateUrl: './layout-public.component.html',
    styleUrl: './layout-public.component.scss',
})
export class LayoutPublicComponent {}

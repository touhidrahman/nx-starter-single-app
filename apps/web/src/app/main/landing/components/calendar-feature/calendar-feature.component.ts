import { CommonModule, NgOptimizedImage } from '@angular/common'
import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'

@Component({
    selector: 'app-calendar-feature',
    imports: [CommonModule, RouterModule, NgOptimizedImage],
    templateUrl: './calendar-feature.component.html',
    styleUrl: './calendar-feature.component.css',
})
export class CalendarFeatureComponent {}

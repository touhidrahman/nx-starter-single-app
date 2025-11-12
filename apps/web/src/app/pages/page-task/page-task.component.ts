import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { PrimeModules } from '@repo/prime-modules'
import { TaskListStateService } from '@repo/task'
import { TaskFilterComponent } from '../../main/task/components/task-filter/task-filter.component'
import { TaskTableComponent } from '../../main/task/components/task-table/task-table.component'

@Component({
    selector: 'app-page-task',
    imports: [
        CommonModule,
        PrimeModules,
        TaskTableComponent,
        TaskFilterComponent,
    ],
    templateUrl: './page-task.component.html',
    styleUrl: './page-task.component.scss',
    providers: [TaskListStateService],
})
export class PageTaskComponent {
    taskListStateService = inject(TaskListStateService)

    onSearch(_event: Event) {}
    show(_mode: 'create' | 'edit') {
        //TODO:
    }
}

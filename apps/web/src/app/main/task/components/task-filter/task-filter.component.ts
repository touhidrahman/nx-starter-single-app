import { CommonModule } from '@angular/common'
import { Component, inject, input, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { PrimeModules } from '@repo/prime-modules'
import { TaskListStateService } from '@repo/task'

@Component({
    selector: 'app-task-filter',
    imports: [CommonModule, PrimeModules, FormsModule],
    templateUrl: './task-filter.component.html',
    styleUrl: './task-filter.component.scss',
})
export class TaskFilterComponent {
    taskListStateService = inject(TaskListStateService)
    showFilter = signal(false)
    status = input<string[]>(['pending', 'in_progress', 'completed', 'overdue'])
    selected = signal('')

    onChangeType(event: string) {
        this.taskListStateService.setState({
            status: event,
        })
    }

    resetFilter() {
        this.taskListStateService.setState({
            status: undefined,
            orderBy: 'asc',
        })
        this.selected.set('')
    }

    sort() {
        const { orderBy } = this.taskListStateService.getState()
        this.taskListStateService.setState({
            orderBy: orderBy === 'asc' ? 'desc' : 'asc',
        })
    }
}

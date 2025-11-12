import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
    MessageListStateService,
    SendMessageFormComponent,
} from '@repo/communication'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-page-communication',
    imports: [
        CommonModule,
        FormsModule,
        PrimeModules,
        ReactiveFormsModule,
        SendMessageFormComponent,
    ],
    templateUrl: './page-communication.component.html',
    styleUrl: './page-communication.component.scss',
    providers: [MessageListStateService],
})
export class PageCommunicationComponent {
    messageListStateService = inject(MessageListStateService)
    isComposeModalOpen = signal<boolean>(false)

    selectMessage(message: any): void {
        this.messageListStateService.setState({ selectedMessage: message })
    }
}

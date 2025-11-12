import { Component, computed, input } from '@angular/core'
import { InitialNamePipe } from '@repo/common-pipes'
import { PrimeModules } from '@repo/prime-modules'
import { Member } from '@repo/case'

@Component({
    selector: 'app-profile-avatar',
    imports: [PrimeModules, InitialNamePipe],
    templateUrl: './profile-avatar.component.html',
    styleUrl: './profile-avatar.component.css',
})
export class ProfileAvatarComponent {
    users = input<Member[]>([])
    maxDisplay = input(3)
    size = input<'normal' | 'large' | 'xlarge'>('normal')
    avatarStyle = input('bg-green-600 font-semibold text-white')
    showTooltips = input(true)

    displayUsers = computed(() => this.users().slice(0, this.maxDisplay()))
    hasMoreUsers = computed(() => this.users().length > this.maxDisplay())
    moreUsersCount = computed(() => this.users().length - this.maxDisplay())
}

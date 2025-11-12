import { Component, input } from '@angular/core'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'user-login-status',
    imports: [PrimeModules],
    template: `
        @if (user()) {
            <div class="block space-x-5">
                @if (profilePhoto()) {
                    <p-avatar
                        id="profileButton"
                        image="{{ profilePhoto() }}"
                        styleClass=" h-10 w-10 border-2 border-gray-300 cursor-pointer  "
                        [style]="{
                            'background-color': '#dee9fc',
                            color: '#1a2551',
                            'font-size': '24px',
                        }"
                        shape="circle" />
                } @else {
                    <p-avatar
                        label="{{ userEmail().slice(0, 1) }}"
                        styleClass="mr-2 uppercase w-10 h-10 border-2 border-gray-300 cursor-pointer"
                        [style]="{
                            'background-color': '#dee9fc',
                            color: '#1a2551',
                        }"
                        shape="circle" />
                }
            </div>
        }
    `,
})
export class UserLoginStatusComponent {
    user = input<string>('')
    profilePhoto = input<string>('')
    userEmail = input<string>('')
}

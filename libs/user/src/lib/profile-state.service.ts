import { Injectable, inject } from '@angular/core'
import { AuthStateService } from '@repo/auth'
import { SimpleStore } from '@repo/store'
import { tap } from 'rxjs'
import { User } from './user.model'

export interface ProfileState {
    profilePicUrlMap: Map<string, string>
    profilePhotoUrl?: string
    profile: User | null
    loading: boolean
}

const initialState: ProfileState = {
    profilePicUrlMap: new Map<string, string>(),
    profilePhotoUrl: 'assets/default-profile/user_default_profile.png',
    profile: null,
    loading: true,
}

@Injectable({
    providedIn: 'root',
})
export class ProfileStateService extends SimpleStore<ProfileState> {
    private initialized = false
    private authStateService = inject(AuthStateService)

    constructor() {
        super(initialState)
    }

    init() {
        if (this.initialized) {
            return
        }
        this.getProfile()
        this.initialized = true
    }

    setProfilePhotoUrl(url: string) {
        this.setState({
            ...this.getState(),
            profilePhotoUrl: url,
        })
    }

    private getProfile() {
        this.authStateService
            .select('user')
            .pipe(tap(() => this.setState({ loading: true })))
            .subscribe((user) => {
                this.setState({
                    ...this.getState(),
                    profile: user,
                    profilePhotoUrl: user?.profilePhoto,
                    loading: false,
                })
            })
    }
}

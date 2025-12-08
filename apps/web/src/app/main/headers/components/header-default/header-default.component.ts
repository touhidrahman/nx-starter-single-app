import { AsyncPipe } from '@angular/common'
import {
    Component,
    ElementRef,
    EventEmitter,
    inject,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    signal,
    ViewChild,
} from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import { WA_LOCATION } from '@ng-web-apis/common'
import { AuthStateService, UserGroupsStateService } from '@repo/auth'
import { AuthApiService, Group } from '@repo/common-auth'
import { ApiResponse } from '@repo/common-models'
import { TextSlicePipe } from '@repo/common-pipes'
import { AlertService } from '@repo/common-services'
import { DateUtil } from '@repo/common-util'
import { NewsTickerCarouselComponent, NewsTickersListStateService } from '@repo/news-ticker'
import {
    PermissionRequestModalComponent,
    PermissionRequestsListStateService,
} from '@repo/permission-request'
import { PrimeModules } from '@repo/prime-modules'
import { Subscription, SubscriptionsApiService } from '@repo/subscription'
import { ProfileStateService } from '@repo/user'
import { UserSettingStateService } from '@repo/user-setting'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'
import { HeaderUtilService } from '../../header-utils/header-util.service'
import { UIstate } from '../../header-utils/ui-state-interface'
import { HeaderSupportComponent } from '../header-support/header-support.component'
import { UserLoginStatusComponent } from '../user-login-status/user-login-satus.component'

@Component({
    selector: 'app-header-default',
    imports: [
        RouterModule,
        PrimeModules,
        AsyncPipe,
        TextSlicePipe,
        UserLoginStatusComponent,
        HeaderSupportComponent,
        NewsTickerCarouselComponent,
    ],
    templateUrl: './header-default.component.html',
    styleUrl: './header-default.component.scss',
    providers: [NewsTickersListStateService, DialogService, DynamicDialogRef],
})
export class HeaderDefaultComponent implements OnInit, OnDestroy {
    private alertService = inject(AlertService)
    private userSettingStateService = inject(UserSettingStateService)
    private router = inject(Router)
    private dialogService = inject(DialogService)

    permissionRequestsListStateService = inject(PermissionRequestsListStateService)
    newsTickerStateService = inject(NewsTickersListStateService)
    userGroupStateService = inject(UserGroupsStateService)
    renderer: Renderer2 = inject(Renderer2)
    headerUtilService = inject(HeaderUtilService)
    authStateService = inject(AuthStateService)
    authApiService = inject(AuthApiService)
    protected profileStateService = inject(ProfileStateService)
    protected subscriptionsApiService = inject(SubscriptionsApiService)
    private readonly location = inject(WA_LOCATION)
    groupType = signal<string>('')

    @Output() sidebarToggle = new EventEmitter<void>()
    @ViewChild('dropdown') dropdown?: ElementRef
    @ViewChild('orgDropdown') orgDropdown?: ElementRef
    @ViewChild('orgChevron') orgChevron?: ElementRef

    groups = signal<any>([])
    isVisible = signal<boolean>(false)
    isNewsTickerVisible = signal<boolean>(this.shouldShowTicker())
    isLoading = signal<boolean>(false)
    isError = signal<boolean>(false)
    isGroupLoading = signal<boolean>(true)
    isGroupError = signal<boolean>(false)
    selectedGroupId = signal<string | null>(null)
    organization = signal<Group | null>(null)
    isOrgDropdownVisible = signal<boolean>(false)

    uiState: UIstate = {
        imageLoaded: true,
        showProfileDropDown: false,
    }

    dateUtil = DateUtil
    formattedDate = this.dateUtil.formatByString(this.dateUtil.date(), 'dd-MM-yyyy')

    subscriptionPlanName = signal<string>('')
    subscriptionPlanId = signal<string>('')
    subscriptionType = signal<string>('')

    toggleSidebar() {
        this.sidebarToggle.emit()
    }

    toggleOrgDropdown() {
        this.isOrgDropdownVisible.set(!this.isOrgDropdownVisible())
        if (this.orgChevron) {
            const chevronEl = this.orgChevron.nativeElement
            if (chevronEl.classList.contains('rotate-90')) {
                this.renderer.removeClass(chevronEl, 'rotate-90')
            } else {
                this.renderer.addClass(chevronEl, 'rotate-90')
            }
        }
    }

    showFallback(event: Event) {
        this.headerUtilService.showFallbackText(event, this.uiState)
    }

    bodyClickListener: (() => void) | null = null

    ngOnInit() {
        this.bodyClickListener = this.renderer.listen(document.body, 'click', (e: Event) => {
            // Handle profile dropdown
            if (
                this.dropdown?.nativeElement.contains(e.target) === false &&
                !(e.target as HTMLElement).closest('user-login-status')
            ) {
                this.isVisible.set(false)
            }
            // Handle organization dropdown
            if (
                this.orgDropdown?.nativeElement.contains(e.target) === false &&
                !(e.target as HTMLElement).closest('.org-name-header')
            ) {
                this.isOrgDropdownVisible.set(false)
                if (this.orgChevron) {
                    this.renderer.removeClass(this.orgChevron.nativeElement, 'rotate-90')
                }
            }
        })

        this.getOrganization(this.authStateService.getGroupId() ?? '')
        this.newsTickerStateService.init(10_000)
        this.onLoadActiveNewsTickers()
        this.profileStateService.init()
        this.groupType.set(this.authStateService.getGroupType() as string)
        if (this.groupType() === 'vendor') {
            this.userGroupStateService.loadMyGroups().subscribe()
            this.getActiveSubscription(this.authStateService.getGroupId() ?? '')
        }
    }

    logout() {
        this.authStateService.logout()
        this.userSettingStateService.setState({
            isPinCodeSet: false,
        })
        this.location.assign('/login')
    }

    onViewDropDown() {
        this.isVisible.set(!this.isVisible())
    }

    onSwitchGroup(id: string) {
        this.isLoading.set(true)
        this.selectedGroupId.set(id)
        this.authStateService.switchOrg(id).subscribe({
            next: (_res) => {
                this.isLoading.set(false)
                this.alertService.success('Group switched successfully.')
                window.location.reload()
                window.location.href = '/dashboard/home'
            },
            error: () => {
                this.isLoading.set(false)
                this.isError.set(true)
                this.alertService.error('Failed to switch group')
            },
        })
    }

    onNavigate(string: string) {
        this.router.navigate([string])
        this.isVisible.set(false)
        this.isOrgDropdownVisible.set(false)
    }

    ngOnDestroy() {
        if (this.bodyClickListener) {
            this.bodyClickListener()
            this.bodyClickListener = null
        }
    }

    onToggleNewsTicker() {
        localStorage.setItem('newsTickerDate', this.formattedDate)
        this.isNewsTickerVisible.set(false)
    }

    openPermissionRequestNotificationModal() {
        this.dialogService.open(PermissionRequestModalComponent, {
            header: 'Notifications',
            width: '50vw',
            breakpoints: {
                '960px': '75vw',
                '640px': '95vw',
            },
            dismissableMask: true,
            closable: true,
        })
    }

    onUpgradeSubscription(id: string) {
        this.router.navigate(['/dashboard/organization/subscribe-plan', id], {
            queryParams: { isYearly: this.subscriptionType() },
        })
    }

    private onLoadActiveNewsTickers() {
        this.newsTickerStateService.setState({
            status: true,
        })
    }

    private getOrganization(_id: string) {
        this.authStateService.select('group').subscribe({
            next: (res) => {
                this.organization.set(res)
            },
        })
    }

    private shouldShowTicker(): boolean {
        const today = this.formattedDate
        const savedDate = localStorage.getItem('newsTickerDate')
        return savedDate !== today
    }

    private getActiveSubscription(groupId: string) {
        this.isLoading.set(true)
        this.subscriptionsApiService.getSubscriptionByGroupId(groupId).subscribe({
            next: (res: ApiResponse<Subscription>) => {
                const { planName, planId, subscriptionType } = res.data
                this.subscriptionPlanName.set(planName as string)
                this.subscriptionPlanId.set(planId as string)
                this.subscriptionType.set(subscriptionType as string)
                this.isLoading.set(false)
            },
            error: () => {
                this.isLoading.set(false)
                this.isError.set(true)
                this.alertService.error('Failed to fetch subscription')
            },
        })
    }

    onLoadOwnedGroups(moreOptionWrapper: HTMLDivElement, chevron: HTMLSpanElement) {
        this.userGroupStateService.loadMyGroups().subscribe({
            next: ({ data }) => {
                moreOptionWrapper.classList.toggle('h-0')
                chevron.classList.toggle('rotate-90')
                if (!data.hasClientGroup || !data.hasVendorGroup) {
                    moreOptionWrapper.classList.toggle('h-24')
                } else {
                    moreOptionWrapper.classList.toggle('h-20')
                }
            },
        })
    }
}

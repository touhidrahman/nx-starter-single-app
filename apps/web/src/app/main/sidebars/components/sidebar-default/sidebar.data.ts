import { NavigationItem } from './sidebar.model'

export const navigationItems: NavigationItem[] = [
    {
        label: 'Home',
        icon: 'pi-home',
        routerLink: '/dashboard/home',
    },
    {
        label: 'Cases',
        icon: 'pi-file-check',
        routerLink: '/dashboard/cases',
    },
    {
        label: 'Calendar',
        icon: 'pi-calendar',
        routerLink: '/dashboard/calendar',
    },
    {
        label: 'Cause List',
        icon: 'pi-receipt',
        routerLink: '/dashboard/cause-list',
    },
    {
        label: 'Clients',
        icon: 'pi-users',
        routerLink: '/dashboard/clients',
    },
    {
        label: 'Documents',
        icon: 'pi-file',
        routerLink: '/dashboard/documents',
    },
    {
        label: 'Courts',
        icon: 'pi-graduation-cap',
        routerLink: '/dashboard/courts',
    },
    {
        label: 'Organization',
        icon: 'pi-building',
        routerLink: '/dashboard/organization',
    },
    {
        label: 'Settings',
        icon: 'pi-cog',
        routerLink: '/dashboard/settings',
    },
    {
        label: 'Feedback',
        icon: 'pi-comments',
        routerLink: '/dashboard/feedback',
    },
    {
        label: 'Referral',
        icon: 'pi-gift',
        routerLink: '/dashboard/referral',
    },
]
export const clientNavigationItems: NavigationItem[] = [
    {
        label: 'Home',
        icon: 'pi-home',
        routerLink: '/dashboard/home/client',
    },
    {
        label: 'My Cases',
        icon: 'pi-tag',
        routerLink: '/dashboard/my-cases',
    },
    {
        label: 'Calendar',
        icon: 'pi-calendar',
        routerLink: '/dashboard/calendar',
    },
    {
        label: 'Organization',
        icon: 'pi-building',
        routerLink: '/dashboard/organization',
    },
    // {
    //     label: 'Settings',
    //     icon: 'pi-cog',
    //     routerLink: '/dashboard/settings',
    // },
    // {
    //     label: 'Communication',
    //     icon: 'pi-comments',
    //     routerLink: 'dashboard/chat',
    // },
]

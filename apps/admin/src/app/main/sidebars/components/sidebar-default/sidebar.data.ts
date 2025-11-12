export interface NavigationItem {
    label: string
    icon: string
    routerLink: string
}

export const navigationItems: NavigationItem[] = [
    {
        label: 'Home',
        icon: 'pi-home',
        routerLink: '/dashboard-home',
    },
    {
        label: 'Admin',
        icon: 'pi-users',
        routerLink: '/admins',
    },
    {
        label: 'Group',
        icon: 'pi-users',
        routerLink: '/groups',
    },
    {
        label: 'User',
        icon: 'pi-users',
        routerLink: '/users',
    },
    {
        label: 'Courts',
        icon: 'pi-briefcase',
        routerLink: '/dashboard/courts',
    },
    // {
    //     label: 'Clients',
    //     icon: 'pi-user',
    //     routerLink: '/client-client-user-list',
    // },
    {
        label: 'Claims',
        icon: 'pi-user',
        routerLink: '/permission-name',
    },
    {
        label: 'Lawyers',
        icon: 'pi-graduation-cap',
        routerLink: '/lawyer-list',
    },
    {
        label: 'Plans',
        icon: 'pi-dollar',
        routerLink: '/plans',
    },
    {
        label: 'Subscriptions',
        icon: 'pi-users',
        routerLink: '/subscription-list',
    },
    {
        label: 'Subscriptions Requests',
        icon: 'pi-user-plus',
        routerLink: '/subscription-request-list',
    },
    {
        label: 'Audit Logs',
        icon: 'pi-database',
        routerLink: '/audit-log',
    },
    {
        label: 'News Tickers',
        icon: 'pi-book',
        routerLink: '/news-tickers',
    },
    {
        label: 'Backups',
        icon: 'pi-cloud-download',
        routerLink: '/backups',
    },
    {
        label: 'Feedback',
        icon: 'pi-comment',
        routerLink: '/feedback',
    },
    {
        label: 'Blogs',
        icon: 'pi-pen-to-square',
        routerLink: '/blogs',
    },
    {
        label: 'News',
        icon: 'pi-megaphone',
        routerLink: '/news',
    },
]

import { TabData } from './tab.model'

export const tabData: TabData[] = [
    {
        route: '/dashboard/organization',
        label: 'Organization',
        icon: 'pi pi-users',
        isClient: true,
    },
    {
        route: '/dashboard/organization/invitations',
        label: 'Invitations',
        icon: 'pi pi-user-plus',
        isClient: true,
    },
    {
        route: '/dashboard/organization/permission',
        label: 'Role & Permission',
        icon: 'pi pi-sitemap',
        isClient: true,
    },
    {
        route: '/dashboard/organization/subscriptions-usages',
        label: 'Subscriptions & Usages',
        icon: 'pi pi-sliders-h',
        isClient: false,
    },
    {
        route: '/dashboard/organization/subscribe-plan',
    },
]

export interface CaseDetailsRoutesData {
    title: string
    path: string
    icon?: string
}

export const caseDetailsRoutesData: CaseDetailsRoutesData[] = [
    {
        title: 'Case Events',
        path: 'event',
        icon: 'pi pi-clipboard',
    },
    {
        title: 'Notes',
        path: 'notes',
        icon: 'pi pi-file-edit', // PrimeIcons book icon
    },
    {
        title: 'Parties',
        path: 'parties',
        icon: 'pi pi-sitemap', // PrimeIcons user icon
    },
    {
        title: 'Documents',
        path: 'documents',
        icon: 'pi pi-file', // PrimeIcons file icon
    },
    {
        title: 'Clients',
        path: 'clients',
        icon: 'pi pi-users', // PrimeIcons users icon
    },
    {
        title: 'Court Transfers',
        path: 'court-transfer',
        icon: 'pi pi-sync', // PrimeIcons sync icon
    },
    {
        title: 'Follow Requests',
        path: 'followers',
        icon: 'pi pi-user-plus', // PrimeIcons user-plus icon
    },
    {
        title: 'Assigned Members',
        path: 'case-members',
        icon: 'pi pi-user-edit',
    },
    {
        title: 'Cause List',
        path: 'causelist',
        icon: 'pi pi-receipt',
    },
]

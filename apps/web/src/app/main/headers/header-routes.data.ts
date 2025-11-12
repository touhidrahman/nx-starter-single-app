interface HeaderRoute {
    id: string
    // url: string
    title: string
    // icon?: string
}

export const publicHeaderData: HeaderRoute[] = [
    // {
    //    url: '/lawyers',
    //    title: 'Find Lawyers'
    // },
    // {
    //    url: '/blogs',
    //    title: 'Blogs'
    // },
    // {
    //    url: '/news',
    //    title: 'News'
    // },
    // {
    //    url: '/pricing',
    //    title: 'Pricing'
    // },
    // {
    //    url: '/home',
    //    title: 'Dashboard'
    // }

    { id: 'lawyer', title: 'Find Lawyers' },
    { id: 'features', title: 'Features' },
    { id: 'pricing', title: 'Pricing' },
    { id: 'faq', title: 'FAQ' },
    { id: 'download', title: 'Download' },
]

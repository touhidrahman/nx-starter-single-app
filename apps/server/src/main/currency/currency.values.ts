import { InsertCurrency } from './core/currency-core.model'

export const DEFAULT_CURRENCIES: InsertCurrency[] = [
    {
        id: 'USD',
        name: 'US Dollar',
        symbol: '$',
        sortOrder: 1,
    },
    {
        id: 'EUR',
        name: 'Euro',
        symbol: '€',
        sortOrder: 2,
    },
    {
        id: 'GBP',
        name: 'British Pound',
        symbol: '£',
        sortOrder: 3,
    },
    {
        id: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        sortOrder: 4,
    },
    {
        id: 'CNY',
        name: 'Chinese Yuan',
        symbol: '¥',
        sortOrder: 5,
    },
    {
        id: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        sortOrder: 6,
    },
    {
        id: 'AUD',
        name: 'Australian Dollar',
        symbol: 'A$',
        sortOrder: 7,
    },
    {
        id: 'CAD',
        name: 'Canadian Dollar',
        symbol: 'C$',
        sortOrder: 8,
    },
    {
        id: 'CHF',
        name: 'Swiss Franc',
        symbol: 'CHF',
        sortOrder: 9,
    },
    {
        id: 'BDT',
        name: 'Bangladeshi Taka',
        symbol: '৳',
        sortOrder: 10,
    },
]

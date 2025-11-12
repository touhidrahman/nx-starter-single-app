import path from 'node:path'
import Bree from 'bree'
import cronstrue from 'cronstrue'

const jobs = [
    {
        name: 'delete-unverified-users',
        interval: 'at 12:01 am',
    },
    {
        name: 'backup-database-weekly',
        interval: 'at 01:00 on Friday',
        description: cronstrue.toString('0 1 * * 5'),
    },
    {
        name: 'remove-database-backup-monthly',
        interval: 'at 02:00 am on the 1st day of the month',
        description: cronstrue.toString('0 0 1 * *'),
    },
]

export const bree = new Bree({
    root: path.join(__dirname, 'jobs'),
    defaultExtension: process.env.NODE_ENV !== 'production' ? 'ts' : 'js',
    jobs,
})

export async function startJobRunner() {
    bree.on('worker created', (_worker) => {})
    bree.on('worker deleted', (_worker) => {})
    await bree.start().then(() => {})
}

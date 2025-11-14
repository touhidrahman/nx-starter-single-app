import { deleteUnverifiedUsers } from '../../main/user/user.service'

async function deleteUnverifiedUsersFn() {
    try {
        const _deletedUsers = await deleteUnverifiedUsers()
    } catch (error) {
        console.error('❌ Failed to delete unverified users:', error)
    }
}
;(async () => {
    await deleteUnverifiedUsersFn()
})()

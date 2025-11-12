import { deleteUnverifiedUsers } from '../../../main/user/user.service'
import { DateUtil } from '../../utils/date.util'

const dateUtil = DateUtil

async function deleteUnverifiedUsersFn() {
    try {
        const deletedUsers = await deleteUnverifiedUsers()
    } catch (error) {
        console.error('❌ Failed to delete unverified users:', error)
    }
}
;(async () => {
    await deleteUnverifiedUsersFn()
})()

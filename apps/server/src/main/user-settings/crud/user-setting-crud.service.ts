import { SelectUserSetting } from '../core/user-setting-core.model'
import { UserSettingCoreService } from '../core/user-setting-core.service'

export class UserSettingCrudService extends UserSettingCoreService {
    static async findByUserIdAndKeyForUser(
        userId: string,
        key: string,
        requestUserId: string,
    ): Promise<SelectUserSetting | null> {
        if (userId !== requestUserId) return null
        return UserSettingCrudService.findByUserIdAndKey(userId, key)
    }
}

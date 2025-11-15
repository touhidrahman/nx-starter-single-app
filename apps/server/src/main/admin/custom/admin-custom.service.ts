import { CryptoService } from '../../auth/crypto.service'
import { SelectAdmin } from '../core/admin-core.model'
import { AdminCoreService } from '../core/admin-core.service'
import { RegisterAdmin } from './admin-custom.model'

export class AdminCustomService extends AdminCoreService {
    static async register(input: RegisterAdmin): Promise<SelectAdmin> {
        const passwordHash = await CryptoService.hashPassword(input.password)
        const result = await AdminCustomService.create({
            ...input,
            password: passwordHash,
        })
        return { ...result, password: '' }
    }

    static async isTableEmpty(): Promise<boolean> {
        const count = await AdminCustomService.count({})
        return count === 0
    }
}

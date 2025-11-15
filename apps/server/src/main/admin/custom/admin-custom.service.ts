import { CryptoService } from '../../auth/crypto.service'
import {
    createAdminAccessToken,
    createAdminRefreshToken,
} from '../../auth/token.util'
import { SelectAdmin } from '../core/admin-core.model'
import { AdminCoreService } from '../core/admin-core.service'
import { AdminLoginResponse, RegisterAdmin } from './admin-custom.model'

export class AdminCustomService extends AdminCoreService {
    static async register(input: RegisterAdmin): Promise<SelectAdmin> {
        const passwordHash = await CryptoService.hashPassword(input.password)
        const result = await AdminCustomService.create({
            ...input,
            password: passwordHash,
        })
        return { ...result, password: '' }
    }

    static async login(
        email: string,
        password: string,
    ): Promise<AdminLoginResponse> {
        const admin = await AdminCustomService.findOne({ email })
        if (!admin) {
            throw new Error('Invalid email or password')
        }

        const isPasswordValid = await CryptoService.verifyPassword(
            password,
            admin.password,
        )
        if (!isPasswordValid) {
            throw new Error('Invalid email or password')
        }

        const accessToken = await createAdminAccessToken(admin)
        const refreshToken = await createAdminRefreshToken(admin)

        return {
            accessToken,
            refreshToken,
            lastLogin: new Date().toISOString(),
            admin: { ...admin, password: '' },
        }
    }

    static async isTableEmpty(): Promise<boolean> {
        const count = await AdminCustomService.count({})
        return count === 0
    }

    static async approve(adminId: string): Promise<SelectAdmin> {
        const admin = await AdminCustomService.update(adminId, {
            verifiedAt: new Date(),
        })
        if (admin) {
            return { ...admin, password: '' }
        }
        throw new Error('Approval failed')
    }
}

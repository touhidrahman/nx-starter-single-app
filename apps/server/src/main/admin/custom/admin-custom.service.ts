import { db } from '../../../db/db'
import { rolesTable } from '../../../db/schema'
import { SEED_DATA_PLANS } from '../../../seed/seed-data'
import { seedPlans } from '../../../utils/seed.service'
import { AccountTypeCrudService } from '../../account-type/crud/account-type-crud.service'
import { CryptoService } from '../../auth/crypto.service'
import {
    createAdminAccessToken,
    createAdminRefreshToken,
} from '../../auth/token.util'
import { APP_DEFAULT_ROLES, DEFAULT_PERMISSIONS } from '../../claim/claims'
import { SelectAdmin } from '../core/admin-core.model'
import { AdminCrudService } from '../crud/admin-crud.service'
import { AdminLoginResponse, RegisterAdmin } from './admin-custom.model'

export class AdminCustomService extends AdminCrudService {
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

    static async initialSeed(): Promise<void> {
        await seedPlans(SEED_DATA_PLANS)

        await AccountTypeCrudService.seed()
        // TODO: transaction categories, subcategories, currency
        await AdminCustomService.seedDefaultRoles()
    }

    static async seedDefaultRoles(): Promise<void> {
        await db.insert(rolesTable).values(
            APP_DEFAULT_ROLES.map((roleId) => ({
                id: roleId,
                name: roleId,
                permissions: DEFAULT_PERMISSIONS.filter((perm) =>
                    perm.forRoles.includes(roleId),
                )
                    .map((perm) => perm.id)
                    .join(','),
                description: `${roleId} role with default permissions`,
            })),
        )
    }
}

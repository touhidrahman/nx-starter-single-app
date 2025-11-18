import { eq, or } from 'drizzle-orm'
import { db } from '../../../db/db'
import { lower } from '../../../db/orm.util'
import { usersTable } from '../../../db/schema'
import { CryptoService } from '../../auth/crypto.service'
import { InsertUser, SelectUser } from '../core/user-core.model'
import { UserCoreService } from '../core/user-core.service'

export class UserCrudService extends UserCoreService {
    static async create(input: InsertUser): Promise<SelectUser> {
        const value = {
            ...input,
            password: await CryptoService.hashPassword(input.password),
        }
        return UserCoreService.create(value)
    }

    static async update(
        id: string,
        input: Partial<InsertUser>,
    ): Promise<SelectUser> {
        if (input.password) {
            input.password = await CryptoService.hashPassword(input.password)
        }
        return UserCoreService.update(id, input)
    }

    static async findByEmailOrUsername(
        emailOrUsername: string,
    ): Promise<SelectUser | null> {
        const res = await db.query.usersTable.findFirst({
            where: or(
                eq(lower(usersTable.email), emailOrUsername.toLowerCase()),
                eq(lower(usersTable.username), emailOrUsername.toLowerCase()),
            ),
        })
        return res ?? null
    }
}

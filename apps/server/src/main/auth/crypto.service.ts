import * as argon2 from 'argon2'

export class CryptoService {
    static async hashPassword(password: string): Promise<string> {
        return argon2.hash(password)
    }

    static async verifyPassword(
        plainPassword: string,
        hash: string,
    ): Promise<boolean> {
        return argon2.verify(hash, plainPassword)
    }
}

import { and, eq } from 'drizzle-orm'
import { db } from '../../core/db/db'
import { generateId } from '../../core/db/id.util'
import { userVerificationTable } from '../../core/db/schema'
import {
    InsertUserVerification,
    SelectUserVerification,
    USER_VERIFICATION_TYPE_VALUES,
} from './user-verification.schema'

export const findVerificationByPhone = async (phone: string) =>
    db.query.userVerificationTable.findFirst({
        where: eq(userVerificationTable.phone, phone),
    })

export const createUserVerification = async (item: InsertUserVerification) =>
    await db.insert(userVerificationTable).values(item).returning()

export const updateVerificationCode = async (
    id: string,
    item: Partial<InsertUserVerification>,
) => {
    return await db
        .update(userVerificationTable)
        .set(item)
        .where(eq(userVerificationTable.id, id))
        .returning()
}

export const findUserVerificationById = async (
    userId: string,
    phone: string,
    verificationType: string,
): Promise<SelectUserVerification | null> => {
    const result = await db.query.userVerificationTable.findFirst({
        where: and(
            eq(userVerificationTable.userId, userId),
            eq(userVerificationTable.phone, phone),
            eq(userVerificationTable.type, verificationType),
        ),
    })

    return result || null
}

export const updateOnlyVerificationCode = async (
    id: string,
    verificationCode: number,
    expiresAt: Date,
) => {
    await db
        .update(userVerificationTable)
        .set({
            verificationCode: verificationCode,
            expiresAt: expiresAt,
            createdAt: new Date(),
        })
        .where(
            and(
                eq(userVerificationTable.id, id),
                eq(
                    userVerificationTable.type,
                    USER_VERIFICATION_TYPE_VALUES.registration,
                ),
            ),
        )
        .returning()
}

export const upsertResetCode = async (
    userId: string,
    phone: string,
    verificationCode: number,
    expiresAt: Date,
) => {
    return db
        .insert(userVerificationTable)
        .values({
            id: generateId(),
            userId: userId,
            phone: phone,
            type: USER_VERIFICATION_TYPE_VALUES.resetPassword,
            verificationCode: verificationCode,
            expiresAt: expiresAt,
            createdAt: new Date(),
        })
        .onConflictDoUpdate({
            target: [userVerificationTable.userId, userVerificationTable.type],
            set: {
                phone: phone,
                verificationCode: verificationCode,
                expiresAt: expiresAt,
                createdAt: new Date(),
            },
        })
        .returning()
}

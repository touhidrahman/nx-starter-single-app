import { and, eq } from 'drizzle-orm'
import { Context, Next } from 'hono'
import { FORBIDDEN } from 'stoker/http-status-codes'
import { db } from '../../core/db/db'
import { rolesTable } from '../../core/db/schema'
import { AccessTokenPayload } from '../auth/token.util'

function hasPermission(claimId: string) {
    return async (ctx: Context, next: Next) => {
        const payload = (await ctx.get('jwtPayload')) as AccessTokenPayload
        if (!payload) return ctx.json({ error: 'Unauthorized' }, FORBIDDEN)

        // check if his role includes the claim in question
        const record = await db
            .select({ claims: rolesTable.claims })
            .from(rolesTable)
            .where(and(eq(rolesTable.id, payload?.roleId)))
            .limit(1)

        if (
            record.length === 0 ||
            !(record?.[0].claims ?? []).includes(claimId)
        ) {
            return ctx.json(
                {
                    error: 'Unauthorized',
                    message: 'User does not have permission',
                    data: {},
                },
                FORBIDDEN,
            )
        }

        return next()
    }
}
